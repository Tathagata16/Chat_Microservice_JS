import React, { useState } from 'react';
import API_BASE_URL from '../utils/config.js';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length === 0) {
            // Handle signup logic here
            const userData = {
                username: formData.username,
                email: formData.email,
                password: formData.password
            };
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                    method: 'POST', // specify POST
                    headers: {
                        'Content-Type': 'application/json', // tell the server it's JSON
                    },
                    body: JSON.stringify(userData), // MUST turn the object into a string
                    credentials: 'include', // MUST include this to receive the cookie!
                });

                const data = await res.json();

                if (res.ok) {
                    alert("Signup successful!");
                    localStorage.setItem('userInfo',JSON.stringify(data.user));
                    setFormData({
                        username: "",
                        email: "",
                        password: ""
                    })
                    // Redirect to login or chat
                    window.location.href = "/chat";
                } else {
                    alert(data.message || "Signup failed");
                }
            } catch (error) {
                console.error("Signup Error:", error);
                alert("Something went wrong. Is the Gateway running?");
            }
        } else {
            setErrors(newErrors);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-black mb-2">Create Account</h1>
                    <p className="text-gray-600">Sign up to get started</p>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username Field */}
                    <div>
                        <label htmlFor="username" className="block text-black font-medium mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username"
                            className={`w-full px-4 py-2 border ${errors.username ? 'border-red-500' : 'border-black'} bg-white text-black focus:outline-none focus:border-gray-500 transition-colors`}
                        />
                        {errors.username && (
                            <p className="text-red-600 text-sm mt-1">{errors.username}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-black font-medium mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-black'} bg-white text-black focus:outline-none focus:border-gray-500 transition-colors`}
                        />
                        {errors.email && (
                            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-black font-medium mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            className={`w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-black'} bg-white text-black focus:outline-none focus:border-gray-500 transition-colors`}
                        />
                        {errors.password && (
                            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-black font-medium mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className={`w-full px-4 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-black'} bg-white text-black focus:outline-none focus:border-gray-500 transition-colors`}
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-2 bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
                    >
                        Sign Up
                    </button>

                    {/* Login Link */}
                    <div className="text-center mt-4">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <a href="/login" className="text-black font-semibold underline hover:text-gray-700">
                                Login
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;