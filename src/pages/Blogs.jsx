import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, UserIcon, EyeIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/blogs`);
      setBlogs(response.data.blogs || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-10 bg-gray-200 rounded-lg w-48 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card">
                <div className="aspect-video bg-gray-100 animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-100 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 py-16 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-amber-300 px-4 py-2 rounded-full text-sm font-medium mb-5">
          <NewspaperIcon className="h-4 w-4" />
          Stories & Insights
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Our Blog</h1>
        <p className="text-violet-200 text-lg">Stories, insights, and inspiration from the world of divine art</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-violet-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <NewspaperIcon className="h-10 w-10 text-violet-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Blogs Yet</h2>
            <p className="text-gray-500">Check back soon for new articles about sculptures and spiritual art</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link
                key={blog._id}
                to={`/blog/${blog.slug}`}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 group hover:-translate-y-1"
              >
                {/* Image */}
                <div className="aspect-video overflow-hidden bg-violet-50">
                  {blog.featuredImage?.url ? (
                    <img
                      src={blog.featuredImage.url}
                      alt={blog.featuredImage.alt || blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <NewspaperIcon className="h-12 w-12 text-violet-200" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3">{blog.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                      {blog.author?.name && (
                        <div className="flex items-center gap-1">
                          <UserIcon className="h-3.5 w-3.5" />
                          <span>{blog.author.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <EyeIcon className="h-3.5 w-3.5" />
                      <span>{blog.views || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;