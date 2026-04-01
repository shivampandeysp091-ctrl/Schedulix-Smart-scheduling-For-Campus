import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Clock, ShieldCheck, BarChart3, BellRing, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiService from "../services/api";

const LandingPage = () => {
  const [formData, setFormData] = useState({
    collegeName: '',
    hodName: '',
    email: '',
    phone: '',
    department: '',
    studentCount: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      // API call to the Spring Boot endpoint
      await apiService.requestDemo(formData);
      setSubmitStatus({
        type: 'success',
        message: "Request submitted! We'll set up your free demo within 48 hours!"
      });
      setFormData({ collegeName: '', hodName: '', email: '', phone: '', department: '', studentCount: '' });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: "Failed to submit request. Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3DFFD] via-[#D8E5FF] to-[#EEF4FF] font-inter text-gray-800 selection:bg-[#9B8CFF] selection:text-white pb-20">

      {/* Glassmorphism Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <img src="/src/assets/logo.jpeg" alt="Schedulix Logo" className="h-10 w-auto rounded-full shadow-md" />
              <span className="font-poppins font-bold text-2xl bg-gradient-to-r from-[#9B8CFF] to-[#2563EB] bg-clip-text text-transparent">
                Schedulix
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost" className="font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full px-6">
                  Login
                </Button>
              </Link>
              <a href="#request-demo">
                <Button className="rounded-full bg-gradient-to-r from-[#9B8CFF] to-[#89BFFF] hover:opacity-90 shadow-lg text-white font-semibold text-md px-8 py-5 border-0 hover:-translate-y-0.5 transition-all">
                  Request Free Demo
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#C8B6FF]/30 rounded-full blur-3xl mix-blend-multiply filter pointer-events-none" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#A8C7FF]/30 rounded-full blur-3xl mix-blend-multiply filter pointer-events-none" />

        <h1 className="text-5xl md:text-7xl font-bold font-poppins mb-6 leading-tight relative z-10 text-gray-900">
          Your Campus Deserves Better <br />
          <span className="bg-gradient-to-r from-[#9B8CFF] to-[#2563EB] bg-clip-text text-transparent">Than WhatsApp Groups.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto relative z-10">
          Empower your institution with an intelligent platform that connects students, faculty, and management seamlessly. Real-time availability, effortless meetings, and centralized announcements.
        </p>
        <div className="flex justify-center gap-4 relative z-10">
          <a href="#request-demo">
            <Button className="rounded-full bg-gradient-to-r from-[#9B8CFF] to-[#2563EB] hover:opacity-90 shadow-xl shadow-indigo-200/50 text-white font-semibold text-lg px-8 py-6 border-0 hover:-translate-y-1 transition-all">
              Try Interactive Demo <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-5xl mx-auto px-4 mb-24 relative z-10">
        <Card className="border-none shadow-2xl rounded-3xl bg-white/60 backdrop-blur-xl">
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-8 p-10 text-center divide-x divide-gray-200/50">
            <div>
              <div className="text-4xl font-bold font-poppins text-indigo-600 mb-2">50+</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Institutions</div>
            </div>
            <div>
              <div className="text-4xl font-bold font-poppins text-indigo-600 mb-2">10k+</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Faculty Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold font-poppins text-indigo-600 mb-2">100k+</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Students Reached</div>
            </div>
            <div>
              <div className="text-4xl font-bold font-poppins text-indigo-600 mb-2">99%</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Uptime</div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 mb-24 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold font-poppins text-center mb-12 text-gray-900">Why choose Schedulix?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <Clock className="w-8 h-8 text-white" />, title: "Real-time Availability", desc: "No more guessing. See exactly when faculty are in class, busy, or available in their cabin based on verified timetables.", bg: "from-[#9B8CFF] to-[#89BFFF]" },
            { icon: <Calendar className="w-8 h-8 text-white" />, title: "Smart Scheduling", desc: "Students can request meetings with one click. Faculty can approve or deny requests instantly from their dashboard.", bg: "from-[#2563EB] to-[#4F46E5]" },
            { icon: <BellRing className="w-8 h-8 text-white" />, title: "Centralized Broadcasts", desc: "HODs and Faculty can instantly post announcements that reach the exact target audience without WhatsApp clutter.", bg: "from-[#F59E0B] to-[#D97706]" },
            { icon: <ShieldCheck className="w-8 h-8 text-white" />, title: "Role-Based Access", desc: "Strict verification ensures only authorized superadmins, management, and enrolled users can access the system.", bg: "from-[#10B981] to-[#059669]" },
            { icon: <BarChart3 className="w-8 h-8 text-white" />, title: "Analytics Dashboard", desc: "Management gets a bird's-eye view of campus activity, faculty engagement, and resource utilization.", bg: "from-[#EC4899] to-[#BE185D]" },
            { icon: <Users className="w-8 h-8 text-white" />, title: "Frictionless UI", desc: "A beautiful, modern, and accessible interface built so users actually enjoy managing their everyday campus workflow.", bg: "from-[#8B5CF6] to-[#6D28D9]" },
          ].map((feature, i) => (
            <Card key={i} className="border-none shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-lg">
              <CardHeader>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.bg} flex items-center justify-center mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-poppins font-bold text-gray-800">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works (Timeline) */}
      <section className="bg-white/40 backdrop-blur-2xl py-24 mb-24 border-y border-white/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-16 text-gray-900">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-indigo-200 to-blue-200 -translate-y-1/2 z-0" />
            {[
              { step: "1", title: "Onboarding", desc: "Superadmin invites HODs and securely loads department faculty." },
              { step: "2", title: "Setup", desc: "Faculty upload Excel timetables. Schedulix parses them automatically." },
              { step: "3", title: "Connect", desc: "Students browse the directory and request meetings seamlessly." },
              { step: "4", title: "Engage", desc: "Faculty approve requests and broadcast announcements campus-wide." }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9B8CFF] to-[#2563EB] flex items-center justify-center text-white text-2xl font-bold font-poppins shadow-xl mb-6 border-4 border-white">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
                <p className="text-gray-600 text-sm px-4">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="max-w-7xl mx-auto px-4 mb-24">
        <h2 className="text-3xl md:text-4xl font-bold font-poppins text-center mb-12 text-gray-900">Tailored for Everyone</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-none shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all rounded-3xl bg-gradient-to-br from-[#2563EB]/5 to-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="p-8 relative z-10">
              <h3 className="text-2xl font-bold font-poppins text-[#2563EB] mb-4">For Students</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#2563EB] w-5 h-5" /> Instantly check if professors are busy</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#2563EB] w-5 h-5" /> Book verified meeting slots</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#2563EB] w-5 h-5" /> Never miss an important announcement</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all rounded-3xl bg-gradient-to-br from-[#9B8CFF]/5 to-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#9B8CFF]/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="p-8 relative z-10">
              <h3 className="text-2xl font-bold font-poppins text-[#7C3AED] mb-4">For Faculty</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#7C3AED] w-5 h-5" /> automated availability status tracking</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#7C3AED] w-5 h-5" /> Manage meeting requests beautifully</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#7C3AED] w-5 h-5" /> Broadcast updates to students quickly</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all rounded-3xl bg-gradient-to-br from-[#F59E0B]/5 to-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="p-8 relative z-10">
              <h3 className="text-2xl font-bold font-poppins text-[#D97706] mb-4">For HODs</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#D97706] w-5 h-5" /> Complete department oversight</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#D97706] w-5 h-5" /> Securely invite and manage faculty</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#D97706] w-5 h-5" /> Pin department-wide urgent notices</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all rounded-3xl bg-gradient-to-br from-[#10B981]/5 to-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="p-8 relative z-10">
              <h3 className="text-2xl font-bold font-poppins text-[#059669] mb-4">For Management</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#059669] w-5 h-5" /> Campus-wide visibility and metrics</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#059669] w-5 h-5" /> Centralized superadmin dashboard</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-[#059669] w-5 h-5" /> Maintain strict data security boundaries</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Request Demo CTA Form */}
      <section id="request-demo" className="max-w-4xl mx-auto px-4 mb-20 scroll-mt-24">
        <Card className="border-none shadow-2xl rounded-3xl bg-white/80 backdrop-blur-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-[#9B8CFF] to-[#2563EB]" />
          <CardHeader className="text-center pt-10 pb-4">
            <CardTitle className="text-3xl font-bold font-poppins text-gray-800">Transform Your Campus Today</CardTitle>
            <p className="text-gray-600 mt-2">Request a 14-day full access sandbox demo to experience Schedulix firsthand.</p>
          </CardHeader>
          <CardContent className="p-10 pt-4">
            {submitStatus && (
              <div className={`p-4 rounded-xl mb-6 text-center shadow-inner ${submitStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleDemoSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">College / University Name *</label>
                  <Input required name="collegeName" value={formData.collegeName} onChange={handleInputChange} className="rounded-xl h-12 bg-white/50 border-gray-200 focus:ring-2 focus:ring-[#9B8CFF]" placeholder="e.g. Stanford University" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Contact Person (HOD/Admin) *</label>
                  <Input required name="hodName" value={formData.hodName} onChange={handleInputChange} className="rounded-xl h-12 bg-white/50 border-gray-200 focus:ring-2 focus:ring-[#9B8CFF]" placeholder="e.g. Dr. Sarah Connor" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Official Email *</label>
                  <Input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="rounded-xl h-12 bg-white/50 border-gray-200 focus:ring-2 focus:ring-[#9B8CFF]" placeholder="hod@university.edu" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Phone Number *</label>
                  <Input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="rounded-xl h-12 bg-white/50 border-gray-200 focus:ring-2 focus:ring-[#9B8CFF]" placeholder="+1 234 567 8900" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Department *</label>
                  <Input required name="department" value={formData.department} onChange={handleInputChange} className="rounded-xl h-12 bg-white/50 border-gray-200 focus:ring-2 focus:ring-[#9B8CFF]" placeholder="Computer Science" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Total Students in Dept *</label>
                  <Input required type="number" name="studentCount" value={formData.studentCount} onChange={handleInputChange} className="rounded-xl h-12 bg-white/50 border-gray-200 focus:ring-2 focus:ring-[#9B8CFF]" placeholder="e.g. 1500" />
                </div>
              </div>
              <Button disabled={isSubmitting} type="submit" className="w-full rounded-2xl bg-gradient-to-r from-[#9B8CFF] to-[#2563EB] hover:opacity-90 shadow-xl text-white font-bold text-lg h-14 mt-4 transition-all">
                {isSubmitting ? 'Submitting Request...' : 'Get My Free Demo Sandbox'}
              </Button>
              <p className="text-center text-xs text-gray-400 mt-4">By submitting this form, you agree to our Terms of Service and Privacy Policy.</p>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Netflix-Style Comprehensive Footer */}
      <footer className="bg-white/60 backdrop-blur-xl border-t border-white/40 mt-12 pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-gray-600 font-inter">
        <div className="max-w-7xl mx-auto">

          {/* Integrated Contact Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-gray-200/60 pb-8">
            <h2 className="text-xl font-poppins font-bold text-gray-800">Questions? Contact Us</h2>
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">Email:</span>
                <a href="mailto:hello@schedulix.com" className="hover:text-indigo-600">hello@schedulix.com</a>
              </div>
              <div className="hidden md:block w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">Call:</span>
                <a href="tel:+919876543210" className="hover:text-indigo-600">+91 98765 43210</a>
              </div>
              <div className="hidden md:block w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">Office:</span>
                <span>123 Innovation Park, Bangalore 560001</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-sm">
            <div className="flex flex-col space-y-4">
              <a href="#" className="hover:text-indigo-600 hover:underline transition-colors">FAQ</a>
              <a href="#" className="hover:text-indigo-600 hover:underline transition-colors">Help Centre</a>
              <a href="#" className="hover:text-indigo-600 hover:underline transition-colors">Account</a>
              <a href="#" className="hover:text-indigo-600 hover:underline transition-colors">Media Centre</a>
            </div>
            <div className="flex flex-col space-y-4">
              <a href="#" className="hover:text-indigo-600 hover:underline transition-colors">Investor Relations</a>
              <a href="#" className="hover:text-indigo-600 hover:underline transition-colors">Jobs</a>
              <a href="#" className="hover:text-indigo-600 hover:underline transition-colors">Ways to Connect</a>
              <a href="#" className="hover:text-indigo-600 hover:underline transition-colors">Terms of Use</a>
            </div>
            <div className="flex flex-col space-y-4">
              <a href="#" className="hover:text-indigo-600 hover:underline transition-colors">Privacy</a>
              <a href="#" className="hover:text-indigo-600 hover:underline transition-colors">Cookie Preferences</a>
              <a href="#" className="hover:text-indigo-600 hover:underline transition-colors">Corporate Information</a>
              <a href="#" className="hover:text-indigo-600 hover:underline transition-colors">Contact Us</a>
            </div>
            <div className="flex flex-col space-y-4">
              <a href="#" className="hover:text-indigo-600 hover:underline transition-colors">Speed Test</a>
              <a href="#" className="hover:text-indigo-600 hover:underline transition-colors">Legal Notices</a>
              <a href="#" className="hover:text-indigo-600 hover:underline transition-colors">Only on Schedulix</a>
            </div>
          </div>

          <p className="text-sm pb-4 font-medium text-gray-700">Schedulix</p>
          <p className="text-xs text-gray-400 max-w-2xl">

            This site is protected by reCAPTCHA and the Google <a href="#" className="hover:underline">Privacy Policy</a> and <a href="#" className="hover:underline">Terms of Service</a> apply.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
