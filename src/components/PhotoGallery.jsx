import { useState } from 'react'
import './PhotoGallery.css'

/**
 * PhotoGallery Component
 * Facebook-style responsive photo grid with lightbox modal
 * Supports 1-10+ images with dynamic layouts
 */
export default function PhotoGallery({ images, title }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // เปิด Lightbox พร้อมเลือกรูปที่คลิก
  const openLightbox = (index) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
    // ป้องกันการ scroll ของ body เมื่อเปิด modal
    document.body.style.overflow = 'hidden'
  }

  // ปิด Lightbox
  const closeLightbox = () => {
    setLightboxOpen(false)
    document.body.style.overflow = 'auto'
  }

  // เลื่อนไปรูปก่อนหน้า
  const goToPrevious = (e) => {
    e.stopPropagation()
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  // เลื่อนไปรูปถัดไป
  const goToNext = (e) => {
    e.stopPropagation()
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  // กด Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') goToPrevious(e)
    if (e.key === 'ArrowRight') goToNext(e)
    if (e.key === 'Escape') closeLightbox()
  }

  // กำหนด layout class ตามจำนวนรูป
  const getGridClass = () => {
    if (images.length === 1) return 'grid-1'
    if (images.length === 2) return 'grid-2'
    if (images.length === 3) return 'grid-3'
    if (images.length === 4) return 'grid-4'
    if (images.length === 5) return 'grid-5'
    return 'grid-many' // 6+ รูป
  }

  return (
    <div className="photo-gallery-container">
      {title && <h3 className="gallery-title">{title}</h3>}
      
      {/* Photo Grid */}
      <div className={`photo-grid ${getGridClass()}`}>
        {images.map((image, index) => (
          <div
            key={index}
            className="photo-item"
            onClick={() => openLightbox(index)}
          >
            <img 
              src={image.src} 
              alt={image.alt || `Gallery image ${index + 1}`}
              loading="lazy"
            />
            {/* แสดง overlay เมื่อ hover */}
            <div className="photo-overlay">
              <span className="zoom-icon">🔍</span>
            </div>
            {/* แสดงจำนวนรูปที่เหลือ (สำหรับรูปที่ 5+) */}
            {index === 4 && images.length > 5 && (
              <div className="more-overlay">
                <span className="more-text">+{images.length - 5}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="lightbox-modal"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button 
            className="lightbox-close"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            ✕
          </button>

          {/* Previous Button */}
          {images.length > 1 && (
            <button 
              className="lightbox-prev"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          {/* Current Image */}
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={images[currentIndex].src} 
              alt={images[currentIndex].alt || `Image ${currentIndex + 1}`}
              className="lightbox-image"
            />
            {/* Image Caption */}
            {images[currentIndex].caption && (
              <div className="lightbox-caption">
                {images[currentIndex].caption}
              </div>
            )}
            {/* Image Counter */}
            <div className="lightbox-counter">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

          {/* Next Button */}
          {images.length > 1 && (
            <button 
              className="lightbox-next"
              onClick={goToNext}
              aria-label="Next image"
            >
              ›
            </button>
          )}

          {/* Thumbnail Navigation (Optional) */}
          <div className="lightbox-thumbnails">
            {images.map((image, index) => (
              <img
                key={index}
                src={image.src}
                alt={`Thumbnail ${index + 1}`}
                className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(index)
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
