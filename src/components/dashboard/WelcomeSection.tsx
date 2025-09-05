import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

const WelcomeSection = () => {
  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-text-dark mb-4">
            Your Task Management Area
          </h1>
          <p className="text-text-soft mb-6 max-w-md leading-relaxed">
            Welcome to your productivity hub. Organize your tasks, track progress, 
            and collaborate with your team efficiently. Stay on top of your goals 
            and deadlines with our intuitive dashboard.
          </p>
          <button className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-hover transition-colors">
            <span>Learn More</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="hidden lg:block flex-shrink-0 ml-8">
          <div className="relative">
            <div className="w-64 h-48 bg-gradient-to-br from-primary/20 to-primary/30 rounded-3xl flex items-end justify-center p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                  <p className="text-sm font-semibold text-text-dark">Task Manager</p>
                  <p className="text-xs text-text-soft">Stay organized</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;