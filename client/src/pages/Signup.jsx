import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../utils/config.js';
import { Link, useNavigate } from 'react-router-dom';

const SignupPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('userInfo')) {
            navigate('/chat', { replace: true });
        }
    }, [navigate]);

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
            setIsSubmitting(true);
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
                    localStorage.setItem('userInfo', JSON.stringify(data.user));
                    setFormData({
                        username: "",
                        email: "",
                        password: "",
                        confirmPassword: ""
                    })
                    // Redirect to login or chat
                    navigate("/chat", { replace: true });
                } else {
                    alert(data.message || "Signup failed");
                }
            } catch (error) {
                console.error("Signup Error:", error);
                alert("Something went wrong. Is the Gateway running?");
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setErrors(newErrors);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
            <div className="absolute inset-0 app-grid-bg opacity-40" />
            <div className="absolute -right-20 top-16 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl float-slow" />
            <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-slate-900/10 blur-3xl float-slow" />

            <div className="panel-surface relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] lg:grid-cols-[0.95fr_1.05fr]">
                <div className="hidden flex-col justify-between bg-[linear-gradient(160deg,#0f172a_0%,#1e293b_58%,#2563eb_100%)] p-10 text-white lg:flex">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-sky-200/90">Get started</p>
                        <h1 className="mt-4 max-w-md text-4xl font-semibold tracking-tight text-balance">Create a workspace that feels fast, clear, and ready for real conversations.</h1>
                        <p className="mt-4 max-w-md text-sm leading-6 text-slate-200/90">Make an account once and keep your conversations synced across devices with a consistent, polished experience.</p>
                    </div>

                    <div className="grid gap-3">
                        {[
                            'Simple sign up with immediate onboarding',
                            'Readable layout with strong visual hierarchy',
                            'Built for desktop, tablet, and mobile screens',
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-sm">✓</span>
                                <span className="text-sm text-slate-100">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative bg-white/85 px-6 py-10 backdrop-blur-xl sm:px-8 lg:px-10">
                    <div className="mx-auto max-w-md">
                        <div className="mb-8 text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-500">Chat app</p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Create account</h1>
                            <p className="mt-3 text-sm leading-6 text-slate-500">Sign up to get started in a few quick steps.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-700">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                    className={`focus-ring w-full rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 ${errors.username ? 'border-rose-300' : 'border-slate-200'}`}
                                />
                                {errors.username && <p className="mt-2 text-sm text-rose-600">{errors.username}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                    className={`focus-ring w-full rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 ${errors.email ? 'border-rose-300' : 'border-slate-200'}`}
                                />
                                {errors.email && <p className="mt-2 text-sm text-rose-600">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    className={`focus-ring w-full rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 ${errors.password ? 'border-rose-300' : 'border-slate-200'}`}
                                />
                                {errors.password && <p className="mt-2 text-sm text-rose-600">{errors.password}</p>}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                    className={`focus-ring w-full rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 ${errors.confirmPassword ? 'border-rose-300' : 'border-slate-200'}`}
                                />
                                {errors.confirmPassword && <p className="mt-2 text-sm text-rose-600">{errors.confirmPassword}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="focus-ring flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? 'Creating account…' : 'Sign Up'}
                            </button>

                            <p className="text-center text-sm text-slate-500">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-slate-950 transition hover:text-slate-700">
                                    Login
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;