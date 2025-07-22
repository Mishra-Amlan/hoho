import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Property } from '@shared/schema';

export default function AdminDashboard() {
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6">
                  <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage audit scheduling, assign auditors, and track progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Audits</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clipboard-list text-orange-500 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Auditors</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-green-500 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-hourglass-half text-purple-500 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">92%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-chart-line text-green-500 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Properties Due for Audit */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Properties Due for Audit</CardTitle>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <i className="fas fa-plus mr-2"></i>Schedule New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {properties?.slice(0, 3).map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <img 
                          src={property.image || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'} 
                          alt={property.name}
                          className="w-16 h-16 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{property.name}</h3>
                          <p className="text-sm text-gray-600">Due: {property.nextAuditDate?.toLocaleDateString()}</p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            property.status === 'red' 
                              ? 'bg-red-100 text-red-800'
                              : property.status === 'amber'
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {property.status === 'red' ? 'High Priority' : 
                             property.status === 'amber' ? 'Medium Priority' : 'Normal Priority'}
                          </span>
                        </div>
                      </div>
                      <Button className="bg-orange-500 hover:bg-orange-600" size="sm">
                        Assign Auditor
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-white text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Sarah Johnson assigned to Taj Palace audit</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-white text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Taj Gateway report approved by QA</p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-calendar text-white text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">New audit scheduled for Taj Coromandel</p>
                      <p className="text-xs text-gray-500">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
