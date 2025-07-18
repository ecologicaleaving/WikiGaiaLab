/**
 * Social Share Widget Component
 * Story 4.5: Community Growth Tools
 * Widget for sharing problems and tracking social engagement
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface SocialShareWidgetProps {
  problemId: string;
  problemTitle: string;
  problemDescription: string;
  userId?: string;
  compact?: boolean;
  showAnalytics?: boolean;
  className?: string;
}

interface ShareData {
  shareId: string;
  shareUrl: string;
  shareTitle: string;
  shareDescription: string;
  shareImageUrl?: string;
  platformUrl: string;
}

interface ShareAnalytics {
  totalShares: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: string;
  platformBreakdown: Record<string, { shares: number; clicks: number; conversions: number }>;
}

export function SocialShareWidget({
  problemId,
  problemTitle,
  problemDescription,
  userId,
  compact = false,
  showAnalytics = false,
  className = ''
}: SocialShareWidgetProps) {
  const [shareAnalytics, setShareAnalytics] = useState<ShareAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure component is only rendered on client side to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (showAnalytics) {
      fetchShareAnalytics();
    }
  }, [problemId, showAnalytics]);

  const fetchShareAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/social/share?problem_id=${problemId}`);
      
      if (response.ok) {
        const data = await response.json();
        setShareAnalytics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching share analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const shareToSocial = async (platform: string, customMessage?: string) => {
    try {
      setSharing(platform);
      
      const response = await fetch('/api/social/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemId,
          platform,
          userId,
          customMessage,
          utmSource: platform,
          utmMedium: 'social',
          utmCampaign: 'problem_share'
        })
      });

      if (response.ok) {
        const data: ShareData = await response.json();
        
        // Open platform-specific share URL
        if (platform === 'copy') {
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            await navigator.clipboard.writeText(data.shareUrl);
            alert('Link copied to clipboard!');
          }
        } else {
          if (typeof window !== 'undefined') {
            window.open(data.platformUrl, '_blank', 'width=600,height=400');
          }
        }
        
        // Refresh analytics if shown
        if (showAnalytics) {
          setTimeout(() => fetchShareAnalytics(), 1000);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create share');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share');
    } finally {
      setSharing(null);
    }
  };

  const socialPlatforms = [
    {
      id: 'twitter',
      name: 'Twitter',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      color: 'bg-blue-400 hover:bg-blue-500'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      color: 'bg-blue-700 hover:bg-blue-800'
    },
    {
      id: 'reddit',
      name: 'Reddit',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      ),
      color: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      ),
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: 'copy',
      name: 'Copy Link',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
      ),
      color: 'bg-gray-600 hover:bg-gray-700'
    }
  ];

  // Don't render on server side to prevent hydration issues
  if (!isClient) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner size="sm" />
        </div>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {socialPlatforms.slice(0, 4).map((platform) => (
          <button
            key={platform.id}
            onClick={() => shareToSocial(platform.id)}
            disabled={sharing === platform.id}
            className={`p-2 rounded-full text-white transition-colors ${platform.color} ${
              sharing === platform.id ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={`Share on ${platform.name}`}
          >
            {sharing === platform.id ? (
              <div className="w-4 h-4 animate-spin">⏳</div>
            ) : (
              platform.icon
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold">Share This Problem</h3>
          <p className="text-gray-600 text-sm mt-1">
            Help spread awareness and get more people involved
          </p>
        </div>

        {/* Problem Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">{problemTitle}</h4>
          <p className="text-gray-600 text-sm line-clamp-3">{problemDescription}</p>
        </div>

        {/* Share Buttons */}
        <div>
          <h4 className="font-medium mb-3">Choose Platform</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {socialPlatforms.map((platform) => (
              <Button
                key={platform.id}
                onClick={() => shareToSocial(platform.id)}
                disabled={sharing === platform.id}
                variant="outline"
                className={`flex items-center justify-center space-x-2 p-3 ${
                  sharing === platform.id ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {sharing === platform.id ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    {platform.icon}
                    <span>{platform.name}</span>
                  </>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Analytics */}
        {showAnalytics && (
          <div>
            <h4 className="font-medium mb-3">Share Analytics</h4>
            {loading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : shareAnalytics ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{shareAnalytics.totalShares}</div>
                  <div className="text-sm text-gray-600">Total Shares</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{shareAnalytics.totalClicks}</div>
                  <div className="text-sm text-gray-600">Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{shareAnalytics.totalConversions}</div>
                  <div className="text-sm text-gray-600">Conversions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{shareAnalytics.conversionRate}%</div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No analytics data available</p>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Make an Impact</h4>
          <p className="text-sm text-blue-800">
            Every share helps bring this problem to more people who can contribute solutions and votes.
            Your voice matters in building a better community!
          </p>
        </div>
      </div>
    </Card>
  );
}