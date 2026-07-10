import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

import Navbar from '../components/Navbar';
import api from '../api/axios';

function Profile() {
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    name: '',
    mobile: ''
  });

  const [image, setImage] = useState(null);

  const [password, setPassword] = useState({
    oldPassword: '',
    newPassword: ''
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile/me');

      setProfile(res.data.data);

      setForm({
        name: res.data.data.name || '',
        mobile: res.data.data.mobile || ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profile fetch failed');
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    if (!form.name || !form.mobile) {
      toast.warning('Please enter name and mobile');
      return;
    }

    try {
      const res = await api.put('/profile/update', form);

      localStorage.setItem('user', JSON.stringify(res.data.data));

      toast.success('Profile updated successfully');

      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profile update failed');
    }
  };

  const uploadImage = async () => {
    if (!image) {
      toast.warning('Please choose profile image');
      return;
    }

    try {
      const data = new FormData();
      data.append('profile_image', image);

      await api.put('/profile/image', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Profile photo updated successfully');

      setImage(null);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Image upload failed');
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();

    if (!password.oldPassword || !password.newPassword) {
      toast.warning('Please enter old and new password');
      return;
    }

    if (password.newPassword.length < 6) {
      toast.warning('New password must be at least 6 characters');
      return;
    }

    try {
      await api.put('/profile/change-password', password);

      toast.success('Password changed successfully');

      setPassword({
        oldPassword: '',
        newPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password change failed');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!profile) {
    return (
      <>
        <Navbar />
        <section className="profile-page">
          <h2>Loading profile...</h2>
        </section>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section className="profile-page">
        <div className="section-title">
          <h2>My Profile 👤</h2>
          <p>Manage your personal information and security.</p>
        </div>

        <div className="premium-profile-layout">
          <motion.div
            className="premium-profile-card"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="profile-image-wrap">
              <img
                src={
                  profile.profile_image
                    ? `http://localhost:3000${profile.profile_image}`
                    : 'https://placehold.co/220x220?text=Profile'
                }
                alt="profile"
              />
            </div>

            <h2>{profile.name}</h2>

            <p>{profile.email}</p>

            <span className="role-pill">
              {profile.role}
            </span>

            <span
              className={
                profile.is_email_verified
                  ? 'verified-pill'
                  : 'not-verified-pill'
              }
            >
              {profile.is_email_verified
                ? 'Email Verified ✅'
                : 'Email Not Verified'}
            </span>

            <div className="profile-upload-box">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />

              <button onClick={uploadImage}>
                Upload Photo
              </button>
            </div>
          </motion.div>

          <motion.div
            className="premium-profile-forms"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="profile-form-box">
              <h2>✏️ Edit Profile</h2>

              <form onSubmit={updateProfile}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value
                    })
                  }
                />

                <input
                  type="email"
                  value={profile.email}
                  readOnly
                />

                <input
                  type="text"
                  placeholder="Mobile Number"
                  value={form.mobile}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mobile: e.target.value
                    })
                  }
                />

                <button type="submit">
                  Update Profile
                </button>
              </form>
            </div>

            <div className="profile-form-box">
              <h2>🔒 Change Password</h2>

              <form onSubmit={changePassword}>
                <input
                  type="password"
                  placeholder="Old Password"
                  value={password.oldPassword}
                  onChange={(e) =>
                    setPassword({
                      ...password,
                      oldPassword: e.target.value
                    })
                  }
                />

                <input
                  type="password"
                  placeholder="New Password"
                  value={password.newPassword}
                  onChange={(e) =>
                    setPassword({
                      ...password,
                      newPassword: e.target.value
                    })
                  }
                />

                <button type="submit">
                  Change Password
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default Profile;