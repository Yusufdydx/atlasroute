import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, MapPin, CheckCircle, AlertCircle, RefreshCw, Settings, Shield, Globe } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface LocationData {
  status: string;
  latitude?: number;
  longitude?: number;
  message?: string;
}

type PageStatus = 'loading' | 'pending' | '_granting' | 'success' | 'error' | 'expired' | 'used' | 'invalid';

type PermissionState = 'checking' | 'granted' | 'denied' | 'prompt' | 'unsupported';

interface PermissionScenario {
  state: PermissionState;
  title: string;
  message: string;
  primaryAction: string;
  showSettingsButton: boolean;
  instructions: string[];
}

function getPermissionScenario(state: PermissionState): PermissionScenario {
  switch (state) {
    case 'granted':
      return {
        state,
        title: 'Location Access Granted',
        message: 'Your location permission is already granted. Click below to get your location.',
        primaryAction: 'Get My Location',
        showSettingsButton: false,
        instructions: []
      };
    case 'denied':
      return {
        state,
        title: 'Location Access Denied',
        message: 'Location access has been blocked. You need to enable it in your browser or device settings.',
        primaryAction: 'Enable Location Access',
        showSettingsButton: true,
        instructions: [
          'Tap "Open Location Settings" below',
          'Find "AtlasRoute" or "this website" in the permissions list',
          'Change "Block" to "Allow" or "Ask"',
          'Return to this page and try again'
        ]
      };
    case 'prompt':
      return {
        state,
        title: 'Location Access Needed',
        message: 'AtlasRoute needs your location to find nearby healthcare facilities. Your location is only used for this request and is never stored.',
        primaryAction: 'Grant Location Access',
        showSettingsButton: false,
        instructions: []
      };
    case 'unsupported':
    default:
      return {
        state,
        title: 'Location Not Supported',
        message: 'Your browser or device does not support location services.',
        primaryAction: 'Try Again',
        showSettingsButton: false,
        instructions: []
      };
  }
}

export default function GetLocPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PageStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [permissionState, setPermissionState] = useState<PermissionState>('checking');
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  useEffect(() => {
    const checkTokenStatus = async () => {
      if (!token) {
        setStatus('invalid');
        return;
      }

      try {
        const response = await fetch(`/api/location/${token}`);
        const data: LocationData = await response.json();
        
        if (data.status === 'confirmed') {
          setStatus('used');
        } else if (data.status === 'expired') {
          setStatus('expired');
        } else if (data.status === 'invalid') {
          setStatus('invalid');
        } else if (data.status === 'pending') {
          setStatus('pending');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('Failed to verify token. Please check your connection and try again.');
      }
    };

    checkTokenStatus();
  }, [token]);

  useEffect(() => {
    const checkGeolocationPermission = async () => {
      setIsCheckingPermission(true);
      
      setTimeout(() => {
        if (!navigator.geolocation) {
          setPermissionState('unsupported');
        } else {
          setPermissionState('prompt');
        }
        setIsCheckingPermission(false);
      }, 500);
    };

    checkGeolocationPermission();
  }, []);

  const handleGrantAccess = () => {
    if (!token) return;

    setStatus('_granting');
    setErrorMessage('');

    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Geolocation is not supported by your browser or device.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetch('/api/location/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStatus('success');
          } else {
            setStatus('error');
            setErrorMessage(data.error || 'Failed to confirm location.');
          }
        })
        .catch(() => {
          setStatus('error');
          setErrorMessage('Failed to save location.');
        });
      },
      (error) => {
        let message = 'Unable to get your location.';
        
        if (error.code === 1) {
          message = 'Location permission denied.';
          setPermissionState('denied');
        } else if (error.code === 2) {
          message = 'Location unavailable. Check GPS is ON.';
        } else if (error.code === 3) {
          message = 'Location request timed out.';
        } else {
          message = 'Unable to get location.';
        }
        
        setStatus('error');
        setErrorMessage(message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleRetry = () => {
    setStatus('pending');
    setErrorMessage('');
    setPermissionState('checking');
    
    const checkPermission = async () => {
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          setPermissionState(result.state as PermissionState);
        } catch (e) {
          setPermissionState('prompt');
        }
      } else {
        setPermissionState('prompt');
      }
    };
    
    setTimeout(checkPermission, 500);
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  const openLocationSettings = () => {
    const userAgent = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    if (isIOS) {
      window.location.href = 'App-Prefs:location';
    } else if (isAndroid) {
      window.location.href = 'android.settings.LOCATION_SOURCE_SETTINGS';
    } else {
      window.location.href = 'chrome://settings/content/location';
    }
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    background: '#f9fafb',
    minHeight: 'calc(100vh - 140px)'
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center'
  };

  const buttonPrimaryStyle: React.CSSProperties = {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '10px',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    maxWidth: '300px'
  };

  const buttonSecondaryStyle: React.CSSProperties = {
    background: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    padding: '14px 24px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    maxWidth: '300px'
  };

  const instructionBoxStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '16px',
    background: '#fef3c7',
    borderRadius: '8px',
    border: '1px solid #f59e0b',
    marginTop: '16px'
  };

  const scenario = getPermissionScenario(permissionState);

  if (status === 'loading' || status === 'pending') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Navbar />
        
        <main style={mainStyle}>
          <div style={containerStyle}>
            {isCheckingPermission ? (
              <>
                <Loader2 className="animate-spin" style={{ width: '48px', height: '48px', margin: '0 auto 20px', color: '#3b82f6' }} />
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#374151' }}>Checking location settings...</h2>
              </>
            ) : permissionState === 'granted' ? (
              <>
                <Shield style={{ width: '64px', height: '64px', margin: '0 auto 20px', color: '#22c55e' }} />
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: '#1f2937' }}>{scenario.title}</h2>
                <p style={{ color: '#4b5563', marginBottom: '24px', fontSize: '15px', lineHeight: '1.6' }}>{scenario.message}</p>
                <button onClick={handleGrantAccess} style={buttonPrimaryStyle}>
                  <MapPin size={22} />
                  {scenario.primaryAction}
                </button>
              </>
            ) : permissionState === 'denied' ? (
              <>
                <AlertCircle style={{ width: '64px', height: '64px', margin: '0 auto 20px', color: '#ef4444' }} />
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: '#1f2937' }}>{scenario.title}</h2>
                <p style={{ color: '#4b5563', marginBottom: '16px', fontSize: '15px', lineHeight: '1.6' }}>{scenario.message}</p>
                {scenario.instructions.length > 0 && (
                  <div style={instructionBoxStyle}>
                    <p style={{ color: '#92400e', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>How to enable:</p>
                    <ol style={{ color: '#92400e', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                      {scenario.instructions.map((inst, i) => (
                        <li key={i} style={{ marginBottom: '4px' }}>{inst}</li>
                      ))}
                    </ol>
                  </div>
                )}
                <div style={{ marginTop: '20px' }}>
                  <button onClick={handleRetry} style={buttonPrimaryStyle}>
                    <RefreshCw size={20} />
                    I've Granted Permission - Try Again
                  </button>
                  <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>
                    Or tell the AI you're having issues and enter your location manually.
                  </p>
                </div>
              </>
            ) : (
              <>
                <Globe style={{ width: '64px', height: '64px', margin: '0 auto 20px', color: '#3b82f6' }} />
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: '#1f2937' }}>{scenario.title}</h2>
                <p style={{ color: '#4b5563', marginBottom: '24px', fontSize: '15px', lineHeight: '1.6' }}>{scenario.message}</p>
                <button onClick={handleGrantAccess} style={buttonPrimaryStyle}>
                  <MapPin size={22} />
                  {scenario.primaryAction}
                </button>
                <div style={{ marginTop: '16px', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
                  <p style={{ color: '#6b7280', fontSize: '13px' }}>💡 When prompted, select <strong>"Allow"</strong> or <strong>"Allow all the time"</strong> for best experience.</p>
                  <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '8px' }}>Or tell the AI you have granted permission.</p>
                </div>
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (status === '_granting') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Navbar />
        
        <main style={mainStyle}>
          <div style={containerStyle}>
            <Loader2 className="animate-spin" style={{ width: '64px', height: '64px', margin: '0 auto 20px', color: '#3b82f6' }} />
            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px', color: '#1f2937' }}>Getting your location...</h2>
            <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '16px' }}>Please allow location access when prompted</p>
            <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b', textAlign: 'left' }}>
              <p style={{ color: '#92400e', fontSize: '14px' }}>💡 If the prompt doesn't appear, check your browser's address bar for a location permission icon.</p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Navbar />
        
        <main style={{ ...mainStyle, background: '#f0fdf4' }}>
          <div style={containerStyle}>
            <CheckCircle style={{ width: '72px', height: '72px', margin: '0 auto 20px', color: '#22c55e' }} />
            <h2 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '12px', color: '#16a34a' }}>Location Confirmed!</h2>
            <p style={{ color: '#4b5563', marginBottom: '28px', fontSize: '16px' }}>Your location has been shared. You can return to the chat now.</p>
            <button onClick={handleGoBack} style={{ ...buttonPrimaryStyle, background: '#22c55e' }}>
              Return to Chat
            </button>
            <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>
              Or tell the AI you have granted permission.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Navbar />
        
        <main style={{ ...mainStyle, background: '#fef2f2' }}>
          <div style={containerStyle}>
            <AlertCircle style={{ width: '64px', height: '64px', margin: '20px auto', color: '#ef4444' }} />
            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px', color: '#dc2626' }}>Unable to Get Location</h2>
            <p style={{ color: '#4b5563', marginBottom: '24px', fontSize: '15px', lineHeight: '1.6' }}>{errorMessage}</p>
            
            {errorMessage.includes('denied') && (
              <div style={instructionBoxStyle}>
                <p style={{ color: '#92400e', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>How to fix:</p>
                <ol style={{ color: '#92400e', fontSize: '14px', paddingLeft: '20px', margin: 0 }}>
                  <li style={{ marginBottom: '4px' }}>Tap "Open Location Settings" below</li>
                  <li style={{ marginBottom: '4px' }}>Find "AtlasRoute" in the permissions list</li>
                  <li style={{ marginBottom: '4px' }}>Change "Block" to "Allow"</li>
                  <li style={{ marginBottom: '4px' }}>Return here and try again</li>
                </ol>
              </div>
            )}
            
            <div style={{ marginTop: '20px' }}>
              <button onClick={handleRetry} style={buttonPrimaryStyle}>
                <RefreshCw size={20} />
                Try Again
              </button>
<p style={{ marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>
              Or tell the AI you're having issues and enter your location manually.
            </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Navbar />
        
        <main style={{ ...mainStyle, background: '#fffbeb' }}>
          <div style={containerStyle}>
            <AlertCircle style={{ width: '64px', height: '64px', margin: '20px auto', color: '#f59e0b' }} />
            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px', color: '#d97706' }}>Link Expired</h2>
            <p style={{ color: '#4b5563', marginBottom: '24px', fontSize: '15px' }}>This link has expired. Please ask the AI to generate a new link.</p>
            <button onClick={handleGoBack} style={{ ...buttonPrimaryStyle, background: '#6b7280' }}>
              Go Back
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (status === 'used') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Navbar />
        
        <main style={{ ...mainStyle, background: '#eff6ff' }}>
          <div style={containerStyle}>
            <CheckCircle style={{ width: '64px', height: '64px', margin: '20px auto', color: '#3b82f6' }} />
            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px', color: '#2563eb' }}>Already Confirmed</h2>
            <p style={{ color: '#4b5563', marginBottom: '24px', fontSize: '15px' }}>Location was already confirmed. You can return to the chat.</p>
            <button onClick={handleGoBack} style={buttonPrimaryStyle}>
              Return to Chat
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Navbar />
        
        <main style={{ ...mainStyle, background: '#fef2f2' }}>
          <div style={containerStyle}>
            <AlertCircle style={{ width: '64px', height: '64px', margin: '20px auto', color: '#ef4444' }} />
            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px', color: '#dc2626' }}>Invalid Link</h2>
            <p style={{ color: '#4b5563', marginBottom: '24px', fontSize: '15px' }}>This link is not valid. Please ask the AI to generate a new link.</p>
            <button onClick={handleGoBack} style={{ ...buttonPrimaryStyle, background: '#6b7280' }}>
              Go Back
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return null;
}