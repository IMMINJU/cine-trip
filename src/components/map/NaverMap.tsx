"use client";

import { useEffect, useRef, useState, useSyncExternalStore, useCallback, useImperativeHandle, forwardRef } from "react";
import { useRouter } from "next/navigation";
import type { Cinema } from "@/db/schema";
import type { CinemaWithWatches } from "@/types";

declare global {
  interface Window {
    __naverMapsLoaded?: boolean;
    __goToCinema__?: (id: string) => void;
    __openNaverMapDirections__?: (lat: number, lng: number, name: string) => void;
    __shareCinema__?: (name: string, address: string) => void;
  }
}

export interface NaverMapHandle {
  panToCinema: (cinema: Cinema) => void;
}

interface NaverMapProps {
  cinemas: CinemaWithWatches[];
  onMarkerClick?: (cinema: CinemaWithWatches) => void;
  center?: { lat: number; lng: number };
  className?: string;
  selectedCinemaId?: string | null;
}

// 기본 중심점 (서울 강남)
const DEFAULT_CENTER = { lat: 37.5013, lng: 127.0396 };

// 브랜드별 마커 색상
const BRAND_COLORS: Record<string, string> = {
  "CGV": "#E74C3C",
  "메가박스": "#9B59B6",
  "롯데시네마": "#3498DB",
  "독립/예술영화관": "#27AE60",
  "기타": "#607D8B",
};

function getServerSnapshot(): boolean {
  return false;
}

function useNaverMapsLoaded() {
  const subscribe = useCallback((callback: () => void) => {
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID;
    if (!clientId) return () => {};

    if (window.naver && window.naver.maps) {
      window.__naverMapsLoaded = true;
      return () => {};
    }

    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.onload = () => {
      window.__naverMapsLoaded = true;
      callback();
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const getSnapshot = useCallback(() => {
    return !!(window.naver && window.naver.maps);
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// 커스텀 마커 아이콘 SVG 생성 (관람 횟수 표시)
function createMarkerIcon(color: string, count: number, isSelected: boolean = false): string {
  const displayCount = count || 0;
  if (isSelected) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="55" viewBox="0 0 44 55"><path fill="${color}" stroke="white" stroke-width="3" d="M22 3C12.6 3 5 10.6 5 20c0 12.5 17 32 17 32s17-19.5 17-32c0-9.4-7.6-17-17-17z"/><text x="22" y="21" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">${displayCount}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="45" viewBox="0 0 36 45"><path fill="${color}" stroke="white" stroke-width="2" d="M18 2C10.3 2 4 8.3 4 16c0 10 14 26 14 26s14-16 14-26c0-7.7-6.3-14-14-14z"/><text x="18" y="17" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">${displayCount}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// 선택된 마커 아이콘 (더 큰 사이즈, 관람 횟수 표시)
function createSelectedMarkerIcon(color: string, count: number): string {
  const displayCount = count || 0;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="60" viewBox="0 0 48 60"><path fill="${color}" stroke="white" stroke-width="3" d="M24 3C14.6 3 7 10.6 7 20c0 12.5 17 34 17 34s17-21.5 17-34c0-9.4-7.6-17-17-17z"/><text x="24" y="21" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">${displayCount}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const NaverMap = forwardRef<NaverMapHandle, NaverMapProps>(function NaverMap({
  cinemas,
  onMarkerClick,
  center,
  className,
  selectedCinemaId,
}, ref) {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<Map<string, naver.maps.Marker>>(new Map());
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null);
  const myLocationMarkerRef = useRef<naver.maps.Marker | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(selectedCinemaId ?? null);
  const isLoaded = useNaverMapsLoaded();

  // 외부에서 selectedCinemaId가 변경되면 반영 (controlled component 패턴)
  const effectiveSelectedId = selectedCinemaId !== undefined ? selectedCinemaId : selectedId;

  // 부드러운 이동 함수
  const panTo = useCallback((lat: number, lng: number, zoom?: number) => {
    if (!mapInstanceRef.current) return;
    const targetPosition = new window.naver.maps.LatLng(lat, lng);
    mapInstanceRef.current.panTo(targetPosition, { duration: 300, easing: 'easeOutCubic' });
    if (zoom) {
      setTimeout(() => {
        mapInstanceRef.current?.setZoom(zoom, true);
      }, 300);
    }
  }, []);

  // InfoWindow 콘텐츠 생성 함수 (목록 형태로 통일)
  const createInfoWindowContent = useCallback((cinema: CinemaWithWatches) => {
    const watches = cinema.watches || [];
    const maxItems = 4;
    const itemsToShow = watches.slice(0, maxItems);
    const remainingCount = watches.length - maxItems;

    const listHtml = itemsToShow.map((watch) => {
      const posterHtml = watch.posterUrl
        ? `<img src="${watch.posterUrl}" alt="${watch.movieTitle}" style="width: 40px; height: 56px; object-fit: cover; border-radius: 4px; flex-shrink: 0;" />`
        : `<div style="width: 40px; height: 56px; background: #f3f4f6; border-radius: 4px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
              <path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
            </svg>
          </div>`;

      const ratingHtml = watch.rating
        ? `<span style="font-size: 11px; color: #facc15;">★ ${watch.rating}</span>`
        : '';

      return `
        <div style="display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
          ${posterHtml}
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center;">
            <p style="margin: 0; font-size: 13px; font-weight: 500; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${watch.movieTitle}</p>
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
              ${ratingHtml}
              <span style="font-size: 11px; color: #9ca3af;">${watch.watchedAt}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const moreHtml = remainingCount > 0
      ? `<p style="margin: 8px 0 0; font-size: 12px; color: #0ea5e9; text-align: center;">+${remainingCount}개 더보기</p>`
      : '';

    return `
      <div onclick="window.__goToCinema__('${cinema.id}')" style="padding: 12px; min-width: 220px; max-width: 280px; font-family: sans-serif; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); cursor: pointer;">
        <h3 style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #111;">${cinema.name}</h3>
        <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">${watches.length}개의 관람 기록</p>
        <div style="max-height: 280px; overflow-y: auto;">
          ${listHtml}
        </div>
        ${moreHtml}
      </div>
    `;
  }, []);

  // ref로 외부에서 호출 가능한 메서드 노출
  useImperativeHandle(ref, () => ({
    panToCinema: (cinema: Cinema) => {
      panTo(cinema.latitude, cinema.longitude, 17);
      setSelectedId(cinema.id);

      // 해당 마커의 InfoWindow 열기 (약간의 딜레이 후)
      setTimeout(() => {
        const marker = markersRef.current.get(cinema.id);
        const cinemaWithWatches = cinemas.find(c => c.id === cinema.id);
        if (marker && mapInstanceRef.current && cinemaWithWatches) {
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }

          const infoWindow = new window.naver.maps.InfoWindow({
            content: createInfoWindowContent(cinemaWithWatches),
            borderWidth: 0,
            backgroundColor: "transparent",
            disableAnchor: true,
            pixelOffset: new window.naver.maps.Point(0, -10),
          });

          infoWindow.open(mapInstanceRef.current, marker);
          infoWindowRef.current = infoWindow;
        }
      }, 350);
    },
  }), [panTo, cinemas, createInfoWindowContent]);

  const mapCenter = center || DEFAULT_CENTER;
  const initialCenterRef = useRef<{ lat: number; lng: number } | null>(null);

  // 지도 초기화 (한 번만)
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    const mapOptions = {
      center: new window.naver.maps.LatLng(mapCenter.lat, mapCenter.lng),
      zoom: 15,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
    };

    mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, mapOptions);
    initialCenterRef.current = mapCenter;

    // 지도 클릭 시 InfoWindow 닫기
    window.naver.maps.Event.addListener(mapInstanceRef.current, "click", () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        setSelectedId(null);
      }
    });
  }, [isLoaded, mapCenter]);

  // 내 위치 마커 표시
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // 기존 내 위치 마커 제거
    if (myLocationMarkerRef.current) {
      myLocationMarkerRef.current.setMap(null);
    }

    // 내 위치 마커 생성 (파란색 원형)
    const myLocationIcon = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#0EA5E9" stroke="#fff" stroke-width="3"/>
        <circle cx="12" cy="12" r="4" fill="#fff"/>
      </svg>
    `)}`;

    myLocationMarkerRef.current = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      map: mapInstanceRef.current,
      icon: {
        url: myLocationIcon,
        size: new window.naver.maps.Size(24, 24),
        anchor: new window.naver.maps.Point(12, 12),
      },
      zIndex: 50,
    });
  }, [isLoaded]);

  // center 변경 시 지도 이동
  useEffect(() => {
    if (!mapInstanceRef.current || !initialCenterRef.current) return;
    if (mapCenter.lat === initialCenterRef.current.lat && mapCenter.lng === initialCenterRef.current.lng) return;

    mapInstanceRef.current.setCenter(new window.naver.maps.LatLng(mapCenter.lat, mapCenter.lng));
  }, [mapCenter]);

  // 마커 아이콘 업데이트 (선택 상태 변경 시)
  const updateMarkerIcon = useCallback((cinemaId: string, isSelected: boolean) => {
    const marker = markersRef.current.get(cinemaId);
    if (!marker) return;

    const cinema = cinemas.find(c => c.id === cinemaId);
    if (!cinema) return;

    const color = cinema.brand ? (BRAND_COLORS[cinema.brand] || BRAND_COLORS["기타"]) : BRAND_COLORS["기타"];
    const count = cinema.watchCount ?? cinema.watches?.length ?? 0;

    if (isSelected) {
      marker.setIcon({
        url: createSelectedMarkerIcon(color, count),
        size: new window.naver.maps.Size(48, 60),
        anchor: new window.naver.maps.Point(24, 60),
      });
      marker.setZIndex(200);
    } else {
      marker.setIcon({
        url: createMarkerIcon(color, count),
        size: new window.naver.maps.Size(36, 45),
        anchor: new window.naver.maps.Point(18, 45),
      });
      marker.setZIndex(100);
    }
  }, [cinemas]);

  // 선택 상태 변경 시 마커 업데이트
  useEffect(() => {
    if (!isLoaded) return;

    // 모든 마커를 기본 상태로
    markersRef.current.forEach((marker, id) => {
      updateMarkerIcon(id, false);
    });

    // 선택된 마커 강조
    if (effectiveSelectedId) {
      updateMarkerIcon(effectiveSelectedId, true);
    }
  }, [effectiveSelectedId, isLoaded, updateMarkerIcon]);

  // 영화관 마커 그리기
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // 기존 마커 정리
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear();

    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    cinemas.forEach((cinema) => {
      const color = cinema.brand ? (BRAND_COLORS[cinema.brand] || BRAND_COLORS["기타"]) : BRAND_COLORS["기타"];
      const count = cinema.watchCount ?? cinema.watches?.length ?? 0;

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(
          cinema.latitude,
          cinema.longitude
        ),
        map: mapInstanceRef.current!,
        title: cinema.name,
        icon: {
          url: createMarkerIcon(color, count),
          size: new window.naver.maps.Size(36, 45),
          anchor: new window.naver.maps.Point(18, 45),
        },
        zIndex: 100,
      });

      window.naver.maps.Event.addListener(marker, "click", () => {
        // 부드럽게 이동
        panTo(cinema.latitude, cinema.longitude);
        setSelectedId(cinema.id);

        // InfoWindow 열기
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }

        const infoWindow = new window.naver.maps.InfoWindow({
          content: createInfoWindowContent(cinema),
          borderWidth: 0,
          backgroundColor: "transparent",
          disableAnchor: true,
          pixelOffset: new window.naver.maps.Point(0, -10),
        });

        infoWindow.open(mapInstanceRef.current!, marker);
        infoWindowRef.current = infoWindow;

        if (onMarkerClick) {
          onMarkerClick(cinema);
        }
      });

      markersRef.current.set(cinema.id, marker);
    });

    // 영화관이 있으면 bounds 조정
    if (cinemas.length > 0 && mapInstanceRef.current && !center) {
      const allPoints = cinemas.map((c) => ({ lat: c.latitude, lng: c.longitude }));

      if (allPoints.length > 1) {
        const bounds = new window.naver.maps.LatLngBounds(
          new window.naver.maps.LatLng(
            Math.min(...allPoints.map((p) => p.lat)),
            Math.min(...allPoints.map((p) => p.lng))
          ),
          new window.naver.maps.LatLng(
            Math.max(...allPoints.map((p) => p.lat)),
            Math.max(...allPoints.map((p) => p.lng))
          )
        );
        mapInstanceRef.current.fitBounds(bounds, {
          top: 80,
          right: 50,
          bottom: 50,
          left: 50,
        });
      }
    }
  }, [isLoaded, cinemas, onMarkerClick, center, panTo, createInfoWindowContent]);

  // 전역 함수들 등록
  useEffect(() => {
    // 상세보기
    window.__goToCinema__ = (id: string) => {
      router.push(`/cinema/${id}`);
    };

    // 네이버 지도 길찾기
    window.__openNaverMapDirections__ = (lat: number, lng: number, name: string) => {
      const url = `nmap://route/walk?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(name)}&appname=movie`;
      const webUrl = `https://map.naver.com/v5/directions/-/-/-/walk?c=${lng},${lat},15,0,0,0,dh`;

      // 모바일에서는 앱 열기 시도, 실패하면 웹으로
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = url;
        setTimeout(() => {
          window.open(webUrl, '_blank');
        }, 1500);
      } else {
        window.open(webUrl, '_blank');
      }
    };

    // 공유하기
    window.__shareCinema__ = async (name: string, address: string) => {
      const shareData = {
        title: name,
        text: `${name}\n${address}`,
        url: window.location.href,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch {
          // 사용자가 취소한 경우
        }
      } else {
        // Web Share API 미지원 시 클립보드 복사
        await navigator.clipboard.writeText(`${name}\n${address}`);
        alert('주소가 클립보드에 복사되었습니다.');
      }
    };

    return () => {
      delete window.__goToCinema__;
      delete window.__openNaverMapDirections__;
      delete window.__shareCinema__;
    };
  }, [router]);

  if (!process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}
      >
        네이버 지도 API 키를 설정해주세요
      </div>
    );
  }

  // 내 위치로 이동 (현재 줌 유지)
  const handleMyLocationClick = () => {
    panTo(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full">
        {!isLoaded && (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
          </div>
        )}
      </div>

      {/* 현재 위치 버튼 */}
      {isLoaded && (
        <button
          onClick={handleMyLocationClick}
          className="absolute bottom-24 lg:bottom-6 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
          aria-label="현재 위치로 이동"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
    </div>
  );
});
