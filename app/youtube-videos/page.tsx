'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { youtubeVideosApi } from '../../lib/api';
import { YouTubeVideo } from '../../lib/types';

export default function YoutubeVideosPage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Omit<YouTubeVideo, 'id'>>({
    title: '',
    youtubeLink: '',
  });


  const filteredVideos = videos.filter((video) => {
    const query = searchTerm.toLowerCase();
    return (
      video.title.toLowerCase().includes(query) ||
      video.youtubeLink.toLowerCase().includes(query)
    );
  });

  const resetForm = () => {
    setFormData({
      title: '',
      youtubeLink: '',
    });
    setEditingVideo(null);
  };


  const loadVideos = async () => {
    try {
      const response = await youtubeVideosApi.list();
      setVideos(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load videos', error);
      alert('Failed to load videos from API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleAddVideo = async () => {
    if (!formData.youtubeLink) {
      return;
    }

    try {
      const newVideo = await youtubeVideosApi.create({
        title: formData.title.trim() || `Video ${videos.length + 1}`,
        youtubeLink: formData.youtubeLink.trim(),
      });


      setVideos((prev) => [newVideo, ...prev]);
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create video', error);
      alert('Failed to create video.');
    }
  };

  const handleEditVideo = (video: YouTubeVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title || '',
      youtubeLink: video.youtubeLink || '',
    });

    setShowAddForm(true);
  };

  const handleUpdateVideo = async () => {
    if (!editingVideo || !formData.youtubeLink) {
      return;
    }

    try {
      const updatedVideo = await youtubeVideosApi.update(editingVideo.id, {
        title: formData.title.trim() || editingVideo.title,
        youtubeLink: formData.youtubeLink.trim(),
      });


      setVideos((prev) => prev.map((video) => (video.id === editingVideo.id ? updatedVideo : video)));
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update video', error);
      alert('Failed to update video.');
    }
  };

  const handleDeleteVideo = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this video?')) {
      try {
        await youtubeVideosApi.remove(id);
        setVideos((prev) => prev.filter((video) => video.id !== id));
      } catch (error) {
        console.error('Failed to delete video', error);
        alert('Failed to delete video.');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="header-title">YouTube Videos Management</h1>
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            + Add YouTube Link
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search videos..."
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-container">
          {loading ? (
            <div className="p-4">Loading videos...</div>
          ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>YouTube Link</th>
                <th>Actions</th>
              </tr>

            </thead>
            <tbody>
              {filteredVideos.map((video) => (
                <tr key={video.id}>
                  <td className="font-medium">{video.title}</td>
                  <td>
                    <a href={video.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      Open Link
                    </a>
                  </td>

                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEditVideo(video)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteVideo(video.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {showAddForm && (
          <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
            <div className="modal-content max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="text-xl font-semibold">{editingVideo ? 'Edit YouTube Video' : 'Add YouTube Video'}</h2>
                <button onClick={() => setShowAddForm(false)} className="btn btn-secondary btn-sm">
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="grid grid-cols-1 gap-4">
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter video title"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">YouTube Link *</label>
                    <input
                      type="url"
                      className="form-input"
                      value={formData.youtubeLink}
                      onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      This link can be used in your main frontend to display/play this video.
                    </p>
                  </div>
                </div>
              </div>


              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={editingVideo ? handleUpdateVideo : handleAddVideo}>
                  {editingVideo ? 'Update Video' : 'Add Video'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
