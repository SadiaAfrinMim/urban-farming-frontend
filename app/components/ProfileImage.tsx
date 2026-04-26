import React from 'react';

interface ProfileImageProps {
  user: {
    name?: string;
    role?: string;
    profileImage?: string;
    profileData?: {
      profilePhoto?: string;
    };
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  user,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-3xl'
  };

  const getProfileImageSrc = () => {
    if (user.role === 'Customer' || user.role === 'Admin') {
      return user.profileImage;
    }
    if (user.role === 'Vendor') {
      return user.profileData?.profilePhoto;
    }
    return null;
  };

  const imageSrc = getProfileImageSrc();

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={user.name || 'Profile'}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center ${className}`}>
      <span className={`${textSizes[size]} font-bold text-white`}>
        {user.name?.charAt(0)?.toUpperCase() || 'U'}
      </span>
    </div>
  );
};

export default ProfileImage;