import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * StarButton - Animated star-shaped button with glow effect
 * Used for game cards and interactive elements
 * 
 * Props:
 * - onClick: Function to call on click
 * - children: Content inside the star
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - variant: 'primary' | 'success' | 'warning' (default: 'primary')
 * - disabled: Boolean
 */
const StarButton = ({ 
  onClick, 
  children, 
  size = 'md',
  variant = 'primary',
  disabled = false,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  const variantClasses = {
    primary: 'text-yellow-400 hover:text-yellow-500',
    success: 'text-green-400 hover:text-green-500',
    warning: 'text-orange-400 hover:text-orange-500',
  };

  const starVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 5 },
    tap: { scale: 0.95 },
  };

  const starContent = '⭐';

  return (
    <motion.button
      variants={starVariants}
      initial="initial"
      whileHover={!disabled ? "hover" : {}}
      whileTap={!disabled ? "tap" : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        relative flex items-center justify-center
        bg-transparent border-none cursor-pointer
        transition-all duration-300 ease-out
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-yellow-300
        ${className}
      `}
      {...props}
    >
      {/* Glow effect background */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{
          boxShadow: disabled 
            ? 'none'
            : [
                '0 0 5px rgba(255, 200, 0, 0)',
                '0 0 15px rgba(255, 200, 0, 0.6)',
                '0 0 5px rgba(255, 200, 0, 0)',
              ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Star icon */}
      <span className={`
        text-3xl drop-shadow-lg
        ${variantClasses[variant]}
        animate-pulse
      `}>
        {starContent}
      </span>

      {/* Additional content */}
      {children && (
        <span className="ml-2 font-bold">
          {children}
        </span>
      )}
    </motion.button>
  );
};

StarButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['primary', 'success', 'warning']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default StarButton;
