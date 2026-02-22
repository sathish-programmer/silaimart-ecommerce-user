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
      <div className="min-h-screen bg-stone-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="mb-8">
            <Link to="/blogs" className="text-primary-600 hover:text-primary-700 font-bold tracking-tight flex items-center gap-2">
              <span className="text-xl">←</span> Back to Sacred Stories
            </Link>
          </nav>

          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <NewspaperIcon className="h-10 w-10 text-primary-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Blog Post Not Found</h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">The wisdom you seek may have moved or doesn't exist.</p>
            <Link to="/blogs" className="btn-primary inline-flex items-center">
              Discover Stories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <nav className="mb-8">
          <Link to="/blogs" className="text-primary-600 hover:text-primary-700 font-bold tracking-tight flex items-center gap-2 group w-fit">
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            Back to Sacred Stories
          </Link>
        </nav>

        <article className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/50">
          {blog.featuredImage?.url ? (
            <div className="aspect-[21/9] overflow-hidden border-b border-gray-50">
              <img
                src={blog.featuredImage.url}
                alt={blog.featuredImage.alt || blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-[21/9] bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center border-b border-gray-50">
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-white/20">
                  <NewspaperIcon className="w-10 h-10 text-primary-600" />
                </div>
                <div className="text-primary-900 font-black text-2xl tracking-tight">{blog.title}</div>
              </div>
            </div>
          )}

          <div className="p-8 md:p-12">
            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-[1.1] tracking-tighter">{blog.title}</h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8 border-y border-gray-50 py-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="font-bold text-gray-700">{blog.author?.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{blog.views} views</span>
                </div>
              </div>

              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {blog.tags.map((tag, index) => (
                    <span key={index} className="bg-stone-100 text-gray-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-gray-200/50 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 bg-stone-50 rounded-2xl p-4 border border-gray-100 mb-10 group/share">
                <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Share this wisdom:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      id: 'facebook', color: 'bg-[#1877F2]', icon: (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      )
                    },
                    {
                      id: 'twitter', color: 'bg-black', icon: (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm1.161 17.52h1.833L7.045 4.126H5.078z" />
                        </svg>
                      )
                    },
                    {
                      id: 'linkedin', color: 'bg-[#0A66C2]', icon: (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      )
                    },
                    {
                      id: 'whatsapp', color: 'bg-[#25D366]', icon: (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                        </svg>
                      )
                    },
                    {
                      id: 'copy', color: 'bg-gray-700', icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )
                    }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => handleShare(btn.id)}
                      className={`${btn.color} text-white p-2.5 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-sm flex items-center justify-center`}
                      title={`Share on ${btn.id}`}
                    >
                      {btn.icon}
                    </button>
                  ))}
                </div>
              </div>

              {blog.excerpt && (
                <p className="text-2xl text-gray-500 leading-relaxed font-medium mb-10 border-l-4 border-primary-500 pl-6 italic">{blog.excerpt}</p>
              )}
            </header>

            <div
              className="prose prose-lg prose-primary max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
              style={{
                '--tw-prose-body': '#4b5563',
                '--tw-prose-headings': '#111827',
                '--tw-prose-links': '#7C3AED',
                '--tw-prose-bold': '#111827',
                '--tw-prose-counters': '#6b7280',
                '--tw-prose-bullets': '#d1d5db',
                '--tw-prose-hr': '#f3f4f6',
                '--tw-prose-quotes': '#111827',
                '--tw-prose-quote-borders': '#7C3AED',
                '--tw-prose-captions': '#6b7280',
                '--tw-prose-code': '#111827',
                '--tw-prose-pre-code': '#f9fafb',
                '--tw-prose-pre-bg': '#1f2937',
                '--tw-prose-th-borders': '#e5e7eb',
                '--tw-prose-td-borders': '#f3f4f6'
              }}
            />
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;