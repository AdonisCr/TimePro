import React, { useState } from 'react';
import { 
  Mail, 
  Star, 
  Archive, 
  Trash2, 
  Reply, 
  Forward, 
  Search,
  Filter,
  MoreHorizontal,
  Paperclip,
  Clock
} from 'lucide-react';

const Inbox = () => {
  const [selectedTab, setSelectedTab] = useState('all');

  const messages = [
    {
      id: 1,
      sender: 'Sarah Johnson',
      subject: 'Project Update - Dashboard Design',
      preview: 'Hi team, I wanted to share the latest progress on the dashboard design project...',
      time: '2 hours ago',
      read: false,
      starred: true,
      priority: 'high',
      hasAttachment: true
    },
    {
      id: 2,
      sender: 'Mike Chen',
      subject: 'Meeting Reminder - Weekly Standup',
      preview: 'Don\'t forget about our weekly standup meeting tomorrow at 10 AM...',
      time: '4 hours ago',
      read: true,
      starred: false,
      priority: 'medium',
      hasAttachment: false
    },
    {
      id: 3,
      sender: 'Emma Wilson',
      subject: 'Design Review Feedback',
      preview: 'I\'ve reviewed the latest designs and have some feedback to share...',
      time: '1 day ago',
      read: false,
      starred: false,
      priority: 'low',
      hasAttachment: true
    },
    {
      id: 4,
      sender: 'Alex Rodriguez',
      subject: 'Budget Approval Request',
      preview: 'Please review and approve the budget for the upcoming quarter...',
      time: '2 days ago',
      read: true,
      starred: true,
      priority: 'high',
      hasAttachment: false
    },
    {
      id: 5,
      sender: 'Lisa Park',
      subject: 'New Team Member Introduction',
      preview: 'I\'d like to introduce our new team member who will be joining us...',
      time: '3 days ago',
      read: true,
      starred: false,
      priority: 'medium',
      hasAttachment: false
    }
  ];

  const tabs = [
    { id: 'all', label: 'All Messages', count: 5 },
    { id: 'unread', label: 'Unread', count: 2 },
    { id: 'starred', label: 'Starred', count: 2 },
    { id: 'archived', label: 'Archived', count: 12 }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const filteredMessages = messages.filter(message => {
    switch (selectedTab) {
      case 'unread': return !message.read;
      case 'starred': return message.starred;
      case 'archived': return false; // No archived messages in this demo
      default: return true;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Inbox</h1>
          <p className="text-text-soft mt-1">Manage your messages and notifications</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors">
          Compose
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-soft w-5 h-5" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 text-text-soft" />
            <span className="text-text-soft">Filter</span>
          </button>
        </div>
      </div>

      {/* Message Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <div className="flex space-x-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-soft hover:text-text-dark'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'bg-gray-100 text-text-soft'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages List */}
        <div className="divide-y divide-gray-100">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`p-6 hover:bg-bg-light transition-colors cursor-pointer border-l-4 ${getPriorityColor(message.priority)} ${
                !message.read ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex items-center space-x-3">
                    <button className={`p-1 rounded ${message.starred ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'} transition-colors`}>
                      <Star className={`w-4 h-4 ${message.starred ? 'fill-current' : ''}`} />
                    </button>
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {message.sender.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-semibold ${!message.read ? 'text-text-dark' : 'text-text-soft'}`}>
                        {message.sender}
                      </h4>
                      {message.hasAttachment && (
                        <Paperclip className="w-4 h-4 text-text-soft" />
                      )}
                    </div>
                    <h5 className={`font-medium mb-1 ${!message.read ? 'text-text-dark' : 'text-text-soft'}`}>
                      {message.subject}
                    </h5>
                    <p className="text-text-soft text-sm line-clamp-2">
                      {message.preview}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 ml-4">
                  <div className="flex items-center space-x-1 text-text-soft">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{message.time}</span>
                  </div>
                  <div className="flex space-x-1">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Reply className="w-4 h-4 text-text-soft" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Archive className="w-4 h-4 text-text-soft" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-text-soft" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <Mail className="w-6 h-6 text-primary" />
            <span className="text-text-soft font-medium">Total Messages</span>
          </div>
          <div className="text-2xl font-bold text-text-dark">127</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <Star className="w-6 h-6 text-yellow-500" />
            <span className="text-text-soft font-medium">Starred</span>
          </div>
          <div className="text-2xl font-bold text-text-dark">12</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <Archive className="w-6 h-6 text-green-600" />
            <span className="text-text-soft font-medium">Archived</span>
          </div>
          <div className="text-2xl font-bold text-text-dark">89</div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;