import React from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
    const posts = [
        {
            id: 1,
            title: "The Future of AI in Indian Judiciary",
            excerpt: "Exploring how artificial intelligence is transforming case management and judgment predictions in Indian courts.",
            date: "Dec 30, 2024",
            readTime: "5 min read",
            category: "Legal Tech"
        },
        {
            id: 2,
            title: "Understanding your Digital Rights",
            excerpt: "A comprehensive guide to data privacy and digital rights in the modern age.",
            date: "Dec 25, 2024",
            readTime: "8 min read",
            category: "Rights"
        },
        {
            id: 3,
            title: "How to Choose the Right Lawyer",
            excerpt: "Tips and tricks for navigating the lawyer marketplace and finding the perfect legal representative.",
            date: "Dec 20, 2024",
            readTime: "6 min read",
            category: "Guide"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">CaseXpert Blog</h1>
                    <p className="mt-4 text-lg text-slate-600">Insights, updates, and guides from the world of law and technology.</p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map(post => (
                        <div key={post.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-start border border-slate-100">
                            <div className="mb-4">
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                    {post.category}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{post.title}</h3>
                            <p className="text-slate-600 mb-4 line-clamp-3">{post.excerpt}</p>
                            <div className="mt-auto flex w-full items-center justify-between text-sm text-slate-500 border-t pt-4">
                                <span>{post.date}</span>
                                <span>{post.readTime}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-12 text-center">
                    <Link to="/news" className="text-blue-600 font-semibold hover:text-blue-800">
                        View More Legal News &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Blog;
