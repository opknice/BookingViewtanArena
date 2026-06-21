/**
 * PhotoGallery Examples - ตัวอย่างการใช้งาน
 * สามารถ copy code ไปใช้ในหน้าอื่นๆ ได้เลย
 */
import PhotoGallery from './PhotoGallery'

// ============================================
// Example 1: Basic Usage
// ============================================
export function BasicGalleryExample() {
  const images = [
    { src: '/image1.jpg', alt: 'รูปภาพที่ 1' },
    { src: '/image2.jpg', alt: 'รูปภาพที่ 2' },
    { src: '/image3.jpg', alt: 'รูปภาพที่ 3' }
  ]

  return <PhotoGallery images={images} title="แกลเลอรี่พื้นฐาน" />
}

// ============================================
// Example 2: Gallery with Captions
// ============================================
export function CaptionGalleryExample() {
  const images = [
    { 
      src: '/event1.jpg', 
      alt: 'งานอีเว้นท์ที่ 1',
      caption: 'งานเปิดตัวสนามใหม่ - มกราคม 2024' 
    },
    { 
      src: '/event2.jpg', 
      alt: 'งานอีเว้นท์ที่ 2',
      caption: 'ทัวร์นาเมนต์ฤดูร้อน - มีนาคม 2024' 
    },
    { 
      src: '/event3.jpg', 
      alt: 'งานอีเว้นท์ที่ 3',
      caption: 'การแข่งขันชิงแชมป์ - พฤษภาคม 2024' 
    }
  ]

  return <PhotoGallery images={images} title="กิจกรรมที่ผ่านมา" />
}

// ============================================
// Example 3: Single Image Showcase
// ============================================
export function SingleImageExample() {
  const images = [
    { 
      src: '/hero-image.jpg', 
      alt: 'ภาพหลักของสนาม',
      caption: 'สนามฟุตบอล VAR วิวตาล อารีน่า' 
    }
  ]

  return <PhotoGallery images={images} title="สนามของเรา" />
}

// ============================================
// Example 4: Multiple Galleries
// ============================================
export function MultipleGalleriesExample() {
  const stadiumImages = [
    { src: '/stadium1.jpg', alt: 'สนาม 1' },
    { src: '/stadium2.jpg', alt: 'สนาม 2' }
  ]

  const facilityImages = [
    { src: '/facility1.jpg', alt: 'สิ่งอำนวยความสะดวก 1' },
    { src: '/facility2.jpg', alt: 'สิ่งอำนวยความสะดวก 2' }
  ]

  const teamImages = [
    { src: '/team1.jpg', alt: 'ทีมงาน 1' },
    { src: '/team2.jpg', alt: 'ทีมงาน 2' }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      <PhotoGallery images={stadiumImages} title="🏟️ สนาม" />
      <PhotoGallery images={facilityImages} title="🏪 สิ่งอำนวยความสะดวก" />
      <PhotoGallery images={teamImages} title="👥 ทีมงาน" />
    </div>
  )
}

// ============================================
// Example 5: Lazy Loading from API
// ============================================
import { useState, useEffect } from 'react'

export function APIGalleryExample() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchImages = async () => {
      try {
        // Replace with your API endpoint
        const response = await fetch('/api/gallery')
        const data = await response.json()
        setImages(data)
      } catch (error) {
        console.error('Error loading images:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>
      <p>กำลังโหลดรูปภาพ...</p>
    </div>
  }

  return <PhotoGallery images={images} title="แกลเลอรี่จาก API" />
}

// ============================================
// Example 6: Filterable Gallery
// ============================================
export function FilterableGalleryExample() {
  const [category, setCategory] = useState('all')

  const allImages = [
    { src: '/img1.jpg', alt: 'Image 1', category: 'event' },
    { src: '/img2.jpg', alt: 'Image 2', category: 'stadium' },
    { src: '/img3.jpg', alt: 'Image 3', category: 'event' },
    { src: '/img4.jpg', alt: 'Image 4', category: 'team' },
    { src: '/img5.jpg', alt: 'Image 5', category: 'stadium' }
  ]

  const filteredImages = category === 'all' 
    ? allImages 
    : allImages.filter(img => img.category === category)

  const buttonStyle = (btnCategory) => ({
    padding: '0.5rem 1.5rem',
    margin: '0 0.5rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    background: category === btnCategory 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : '#e0e0e0',
    color: category === btnCategory ? 'white' : '#333',
    transition: 'all 0.3s ease'
  })

  return (
    <div>
      {/* Filter Buttons */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button 
          style={buttonStyle('all')}
          onClick={() => setCategory('all')}
        >
          ทั้งหมด
        </button>
        <button 
          style={buttonStyle('event')}
          onClick={() => setCategory('event')}
        >
          กิจกรรม
        </button>
        <button 
          style={buttonStyle('stadium')}
          onClick={() => setCategory('stadium')}
        >
          สนาม
        </button>
        <button 
          style={buttonStyle('team')}
          onClick={() => setCategory('team')}
        >
          ทีมงาน
        </button>
      </div>

      {/* Gallery */}
      <PhotoGallery 
        images={filteredImages} 
        title={`${category === 'all' ? 'ทั้งหมด' : category} (${filteredImages.length} รูป)`}
      />
    </div>
  )
}

// ============================================
// Example 7: Gallery with Custom Wrapper
// ============================================
export function CustomWrapperExample() {
  const images = [
    { src: '/img1.jpg', alt: 'Image 1' },
    { src: '/img2.jpg', alt: 'Image 2' },
    { src: '/img3.jpg', alt: 'Image 3' }
  ]

  return (
    <section style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '4rem 2rem',
      borderRadius: '20px',
      color: 'white'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          textAlign: 'center', 
          marginBottom: '1rem',
          color: 'white'
        }}>
          🌟 แกลเลอรี่พิเศษ
        </h2>
        <p style={{ 
          textAlign: 'center', 
          marginBottom: '3rem',
          fontSize: '1.2rem',
          opacity: 0.9
        }}>
          รวมภาพบรรยากาศที่ดีที่สุดของเรา
        </p>
        <PhotoGallery images={images} />
      </div>
    </section>
  )
}

// ============================================
// Example 8: Minimal Gallery (No Title)
// ============================================
export function MinimalGalleryExample() {
  const images = [
    { src: '/img1.jpg', alt: 'Image 1' },
    { src: '/img2.jpg', alt: 'Image 2' }
  ]

  // ไม่ใส่ title prop
  return <PhotoGallery images={images} />
}

// ============================================
// Example 9: Before/After Gallery
// ============================================
export function BeforeAfterGalleryExample() {
  const beforeImages = [
    { src: '/before1.jpg', alt: 'ก่อนปรับปรุง 1', caption: 'ก่อนปรับปรุง' },
    { src: '/before2.jpg', alt: 'ก่อนปรับปรุง 2', caption: 'ระหว่างการก่อสร้าง' }
  ]

  const afterImages = [
    { src: '/after1.jpg', alt: 'หลังปรับปรุง 1', caption: 'หลังปรับปรุง' },
    { src: '/after2.jpg', alt: 'หลังปรับปรุง 2', caption: 'สนามใหม่เอี่ยม' }
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div>
        <PhotoGallery images={beforeImages} title="⏪ ก่อนปรับปรุง" />
      </div>
      <div>
        <PhotoGallery images={afterImages} title="⏩ หลังปรับปรุง" />
      </div>
    </div>
  )
}

// ============================================
// Example 10: Testimonial Gallery
// ============================================
export function TestimonialGalleryExample() {
  const testimonialImages = [
    { 
      src: '/review1.jpg', 
      alt: 'รีวิวจากลูกค้า 1',
      caption: '"สนามสวยมาก บรรยากาศดี" - คุณสมชาย' 
    },
    { 
      src: '/review2.jpg', 
      alt: 'รีวิวจากลูกค้า 2',
      caption: '"ทีมงานบริการดีเยี่ยม" - คุณสมหญิง' 
    },
    { 
      src: '/review3.jpg', 
      alt: 'รีวิวจากลูกค้า 3',
      caption: '"จองง่าย ราคาไม่แพง" - คุณประยุทธ์' 
    }
  ]

  return (
    <div style={{ 
      background: '#f9f9f9', 
      padding: '3rem', 
      borderRadius: '12px' 
    }}>
      <PhotoGallery images={testimonialImages} title="💬 รีวิวจากลูกค้า" />
    </div>
  )
}
