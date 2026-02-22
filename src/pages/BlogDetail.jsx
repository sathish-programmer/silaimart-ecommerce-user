import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CalendarIcon, UserIcon, EyeIcon, TagIcon, ShareIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = blog.title;
    const text = blog.excerpt || title;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      copy: url
    };
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const fetchBlog = async () => {
    try {
      const response = await axios.get(`${API_URL}/blogs/${slug}`);
      setBlog(response.data);
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Blog not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="h-6 bg-gray-50 rounded w-32 mb-8 animate-pulse"></div>
          
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
            <div className="aspect-video bg-gray-50 animate-pulse"></div>
            <div className="p-8 space-y-6">
              <div className="h-10 bg-gray-50 rounded w-3/4 animate-pulse"></div>
              <div className="flex space-x-6">
                <div className="h-4 bg-gray-50 rounded w-24 animate-pulse"></div>
                <div className="h-4 bg-gray-50 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-50 rounded w-20 animate-pulse"></div>
              </div>
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-50 rounded w-full animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="mb-8">
            <Link to="/blogs" className="text-primary-600 hover:text-accent-600">← Back to Blog</Link>
          </nav>

          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Blog Post Not Found</h2>
            <Link to="/blogs" className="bg-primary-600 text-black px-8 py-3 rounded-lg font-semibold hover:bg-accent-500">
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <nav className="mb-8">
          <Link to="/blogs" className="text-primary-600 hover:text-accent-600">← Back to Blog</Link>
        </nav>

        <article className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden border border-gray-200">
          {blog.featuredImage?.url ? (
            <div className="aspect-video overflow-hidden">
              <img
                src={blog.featuredImage.url}
                alt={blog.featuredImage.alt || blog.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center" style={{display: 'none'}}>
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                  </div>
                  <div className="text-white font-bold text-2xl">{blog.title}</div>
                  <div className="text-gray-400 text-lg mt-2">Blog Article</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                  </div>
                  <div className="text-white font-bold text-2xl">{blog.title}</div>
                  <div className="text-gray-400 text-lg mt-2">Blog Article</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-8">
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">{blog.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-4">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4" />
                  <span>{blog.author?.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EyeIcon className="h-4 w-4" />
                  <span>{blog.views} views</span>
                </div>
              </div>
              
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex items-center space-x-2 mb-4">
                  <TagIcon className="h-4 w-4 text-primary-600" />
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, index) => (
                      <span key={index} className="bg-primary-600/20 text-primary-600 px-3 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2 mb-6">
                <ShareIcon className="h-4 w-4 text-primary-600" />
                <span className="text-gray-400 text-sm mr-2">Share:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                    title="Share on Facebook"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-lg transition-colors"
                    title="Share on Twitter"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="bg-blue-700 hover:bg-blue-800 text-white p-2 rounded-lg transition-colors"
                    title="Share on LinkedIn"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                    title="Share on WhatsApp"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
                    title="Copy Link"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {blog.excerpt && (
                <p className="text-xl text-gray-300 leading-relaxed">{blog.excerpt}</p>
              )}
            </header>
            
            <div 
              className="prose prose-invert prose-bronze max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
              style={{
                '--tw-prose-body': '#e5e7eb',
                '--tw-prose-headings': '#f9fafb',
                '--tw-prose-links': '#CD7F32',
                '--tw-prose-bold': '#f9fafb',
                '--tw-prose-counters': '#9ca3af',
                '--tw-prose-bullets': '#6b7280',
                '--tw-prose-hr': '#374151',
                '--tw-prose-quotes': '#e5e7eb',
                '--tw-prose-quote-borders': '#374151',
                '--tw-prose-captions': '#9ca3af',
                '--tw-prose-code': '#f9fafb',
                '--tw-prose-pre-code': '#e5e7eb',
                '--tw-prose-pre-bg': '#1f2937',
                '--tw-prose-th-borders': '#374151',
                '--tw-prose-td-borders': '#374151'
              }}
            />
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;