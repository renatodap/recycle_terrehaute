import React from 'react';

export const LeafIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 8C17 10.65 15.35 12.85 13 13.65V21H11V13.65C8.65 12.85 7 10.65 7 8C7 5.24 9.24 3 12 3C14.76 3 17 5.24 17 8Z" fill="currentColor" fillOpacity="0.2"/>
    <path d="M12 3C9.24 3 7 5.24 7 8C7 10.65 8.65 12.85 11 13.65V21H13V13.65C15.35 12.85 17 10.65 17 8C17 5.24 14.76 3 12 3ZM12 11.5C10.07 11.5 8.5 9.93 8.5 8C8.5 6.07 10.07 4.5 12 4.5C13.93 4.5 15.5 6.07 15.5 8C15.5 9.93 13.93 11.5 12 11.5Z" fill="currentColor"/>
    <path d="M12 6C10.9 6 10 6.9 10 8C10 9.1 10.9 10 12 10C13.1 10 14 9.1 14 8C14 6.9 13.1 6 12 6Z" fill="currentColor" fillOpacity="0.3"/>
  </svg>
);

export const RecycleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L4.5 11.5L7.5 11.5L7.5 20L10.5 20L10.5 11.5L13.5 11.5L12 2Z" fill="currentColor" fillOpacity="0.3"/>
    <path d="M16.5 12.5L13.5 12.5L13.5 4L10.5 4L10.5 12.5L7.5 12.5L12 22L16.5 12.5Z" fill="currentColor" fillOpacity="0.3" transform="rotate(120 12 12)"/>
    <path d="M19.5 11.5L16.5 11.5L16.5 20L13.5 20L13.5 11.5L10.5 11.5L12 2L19.5 11.5Z" fill="currentColor" fillOpacity="0.3" transform="rotate(240 12 12)"/>
    <path d="M12 2.5L4.8 11L7.3 11L7.3 19L10.3 19L10.3 11L12.8 11L12 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2"/>
  </svg>
);

export const CameraIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="6" width="18" height="14" rx="2" fill="currentColor" fillOpacity="0.1"/>
    <circle cx="12" cy="13" r="4" fill="currentColor" fillOpacity="0.2"/>
    <circle cx="12" cy="13" r="2.5" fill="currentColor" fillOpacity="0.4"/>
    <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const SearchIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="7" fill="currentColor" fillOpacity="0.1"/>
    <circle cx="10" cy="10" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M15 15L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 7C8 7 9 6 10 6C11 6 12 6.5 12 7.5C12 8.5 11 9 10 9C9 9 8 9.5 8 10.5C8 11.5 9 12 10 12C11 12 12 11 12 11" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round"/>
  </svg>
);

export const LocationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="currentColor" fillOpacity="0.15"/>
    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="9" r="2.5" fill="currentColor" fillOpacity="0.3"/>
    <circle cx="12" cy="9" r="1.5" fill="currentColor"/>
  </svg>
);

export const EarthIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1"/>
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 2C12 2 16 6 16 12C16 18 12 22 12 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2.5 12H21.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4 8H20" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeLinecap="round"/>
    <path d="M4 16H20" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeLinecap="round"/>
  </svg>
);

export const CheckCircleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15"/>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ArrowRightIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const UploadIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 10L12 3L17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 3V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="16" r="1" fill="currentColor"/>
  </svg>
);

export const TrashIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 7V20C6 20.5523 6.44772 21 7 21H17C17.5523 21 18 20.5523 18 20V7" fill="currentColor" fillOpacity="0.15"/>
    <path d="M5 7H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 7V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 7V20C6 20.5523 6.44772 21 7 21H17C17.5523 21 18 20.5523 18 20V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 11V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M14 11V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const CompostIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C7 2 4 5 4 8C4 11 5 13 7 15C9 17 11 18 11 20V22H13V20C13 18 15 17 17 15C19 13 20 11 20 8C20 5 17 2 12 2Z" fill="currentColor" fillOpacity="0.15"/>
    <path d="M12 2C7 2 4 5 4 8C4 11 5 13 7 15C9 17 11 18 11 20V22H13V20C13 18 15 17 17 15C19 13 20 11 20 8C20 5 17 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 8C8 8 9 10 12 10C15 10 16 8 16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="0.5" fill="currentColor"/>
    <circle cx="15" cy="7" r="0.5" fill="currentColor"/>
  </svg>
);