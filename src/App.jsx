import React, { useState, useEffect } from 'react';

function App() {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'wildlife',
    description: '',
    severity: 'medium',
    lat: null,
    lng: null,
    photo: null
  });
  const [locationText, setLocationText] = useState('Get Location');
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('reports');
    if (saved) setReports(JSON.parse(saved));
  }, []);

  const saveReports = (newReports) => {
    setReports(newReports);
    localStorage.setItem('reports', JSON.stringify(newReports));
  };

  const getLocation = () => {
    setLocationText('Getting...');
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setLocationText('Not Supported');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({
          ...formData, 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude
        });
        setLocationText(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setLocationError('');
      },
      (err) => {
        let errorMsg = '';
        switch(err.code) {
          case 1:
            errorMsg = 'Permission denied. Please allow location access.';
            break;
          case 2:
            errorMsg = 'Position unavailable. Check GPS.';
            break;
          case 3:
            errorMsg = 'Timeout. Please try again.';
            break;
          default:
            errorMsg = 'Failed to get location.';
        }
        setLocationError(errorMsg);
        setLocationText('Retry');
      },
      options
    );
  };

  const takePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => setFormData({...formData, photo: event.target.result});
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const submitReport = (e) => {
    e.preventDefault();
    if (editingId) {
      const updatedReports = reports.map(report => 
        report.id === editingId 
          ? { ...formData, id: editingId, timestamp: report.timestamp }
          : report
      );
      saveReports(updatedReports);
    } else {
      const newReport = {
        id: Date.now(),
        ...formData,
        timestamp: new Date().toLocaleString()
      };
      saveReports([newReport, ...reports]);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({title:'', category:'wildlife', description:'', severity:'medium', lat:null, lng:null, photo:null});
    setLocationText('Get Location');
    setLocationError('');
  };

  const editReport = (report) => {
    setFormData({
      title: report.title,
      category: report.category,
      description: report.description,
      severity: report.severity,
      lat: report.lat,
      lng: report.lng,
      photo: report.photo
    });
    setEditingId(report.id);
    setShowForm(true);
    if (report.lat) {
      setLocationText(`${report.lat.toFixed(4)}, ${report.lng.toFixed(4)}`);
    } else {
      setLocationText('Get Location');
    }
  };

  const deleteReport = (id) => {
    if (confirm('Delete this report?')) saveReports(reports.filter(r => r.id !== id));
  };

  const getCategoryColor = (cat) => {
    const colors = {
      wildlife:'#2196f3', 
      damage:'#ff9800', 
      flytipping:'#f44336', 
      maintenance:'#4caf50', 
      critical:'#9c27b0',
      other:'#757575'
    };
    return colors[cat] || '#2196f3';
  };

  const getCategoryName = (cat) => {
    const names = {
      wildlife:'Wildlife', 
      damage:'Damage', 
      flytipping:'Fly-Tipping', 
      maintenance:'Maintenance', 
      critical:'Critical',
      other:'Other'
    };
    return names[cat] || cat;
  };

  const lowCount = reports.filter(r => r.severity === 'low').length;
  const mediumCount = reports.filter(r => r.severity === 'medium').length;
  const highCount = reports.filter(r => r.severity === 'high').length;

  return (
    <div style={{background:'white', minHeight:'100vh', textAlign:'center'}}>
      <div style={{background:'white', color:'#1976d2', padding:'30px 20px', borderBottom:'1px solid #e0e0e0'}}>
        <h1 style={{margin:0, fontSize:28, fontWeight:'bold'}}>Outdoor Site Reports</h1>
        <p style={{margin:'12px 0 0', fontSize:14, color:'#666'}}>Record wildlife, damage, maintenance and more</p>
        <button onClick={() => {
          setEditingId(null);
          setFormData({title:'', category:'wildlife', description:'', severity:'medium', lat:null, lng:null, photo:null});
          setLocationText('Get Location');
          setLocationError('');
          setShowForm(true);
        }} style={{background:'#1976d2', color:'white', border:'none', padding:'12px 32px', borderRadius:40, fontWeight:'bold', fontSize:16, marginTop:25, cursor:'pointer'}}>
          New Report
        </button>
      </div>

      <div style={{padding:'20px', background:'white'}}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 15,
          maxWidth: 400,
          margin: '0 auto'
        }}>
          <div style={{background:'#f5f5f5', borderRadius:16, padding:'16px 12px', textAlign:'center'}}>
            <div style={{fontSize:28, fontWeight:'bold', color:'#1976d2'}}>{reports.length}</div>
            <div style={{fontSize:12, color:'#666'}}>Total Reports</div>
          </div>
          <div style={{background:'#f5f5f5', borderRadius:16, padding:'16px 12px', textAlign:'center'}}>
            <div style={{fontSize:28, fontWeight:'bold', color:'#4caf50'}}>{lowCount}</div>
            <div style={{fontSize:12, color:'#666'}}>Low</div>
          </div>
          <div style={{background:'#f5f5f5', borderRadius:16, padding:'16px 12px', textAlign:'center'}}>
            <div style={{fontSize:28, fontWeight:'bold', color:'#ff9800'}}>{mediumCount}</div>
            <div style={{fontSize:12, color:'#666'}}>Medium</div>
          </div>
          <div style={{background:'#f5f5f5', borderRadius:16, padding:'16px 12px', textAlign:'center'}}>
            <div style={{fontSize:28, fontWeight:'bold', color:'#f44336'}}>{highCount}</div>
            <div style={{fontSize:12, color:'#666'}}>High</div>
          </div>
        </div>
      </div>

      <div style={{padding:'0 16px 20px 16px', background:'white'}}>
        {reports.length === 0 && (
          <div style={{textAlign:'center', padding:60, background:'#fafafa', borderRadius:20, marginTop:10}}>
            <div style={{fontSize:16, color:'#999'}}>No reports yet</div>
            <div style={{fontSize:13, color:'#bbb', marginTop:8}}>Tap New Report to get started</div>
          </div>
        )}
        {reports.map(report => (
          <div key={report.id} style={{background:'#fafafa', marginBottom:16, padding:20, borderRadius:20, textAlign:'center', border:'1px solid #f0f0f0'}}>
            <div style={{display:'inline-block', background:getCategoryColor(report.category), color:'white', padding:'6px 18px', borderRadius:25, fontSize:12, fontWeight:'bold', marginBottom:14}}>
              {getCategoryName(report.category)}
            </div>
            <div style={{fontSize:18, fontWeight:'bold', color:'#333', marginBottom:8}}>{report.title}</div>
            
            <div style={{fontSize:14, color:'#555', margin:'12px 0', lineHeight:1.5, wordBreak:'break-word', whiteSpace:'pre-wrap'}}>{report.description}</div>
            
            <div style={{display:'inline-block', background:'#e8e8e8', color:'#666', padding:'4px 14px', borderRadius:20, fontSize:11, fontWeight:'bold'}}>
              {report.severity.toUpperCase()}
            </div>
            
            {report.photo && (
              <div style={{marginTop:14}}>
                <img src={report.photo} alt="report" style={{maxWidth:'100%', maxHeight:200, borderRadius:12, objectFit:'contain'}} />
              </div>
            )}
            
            <div style={{marginTop:12}}>
              <div style={{fontSize:12, color:'#999', marginBottom:4}}>{report.timestamp}</div>
              {report.lat && (
                <div style={{fontSize:12, color:'#999'}}>
                  {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                </div>
              )}
            </div>
            
            <div style={{marginTop:16, display:'flex', justifyContent:'center', gap:12}}>
              <button onClick={() => editReport(report)} style={{background:'#fff', color:'#1976d2', border:'1px solid #1976d2', padding:'8px 24px', borderRadius:30, cursor:'pointer', fontSize:13}}>
                Edit
              </button>
              <button onClick={() => deleteReport(report.id)} style={{background:'#fff', color:'#ef5350', border:'1px solid #ef5350', padding:'8px 24px', borderRadius:30, cursor:'pointer', fontSize:13}}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
          <div style={{background:'white', borderRadius:28, maxWidth:500, width:'90%', maxHeight:'85%', overflow:'auto', padding:28, textAlign:'center'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
              <h2 style={{margin:0, color:'#1976d2', fontSize:22}}>{editingId ? 'Edit Report' : 'New Report'}</h2>
              <button onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }} style={{background:'#f0f0f0', border:'none', fontSize:18, width:36, height:36, borderRadius:25, cursor:'pointer'}}>✕</button>
            </div>

            <form onSubmit={submitReport}>
              <div style={{marginBottom:18}}>
                <label style={{display:'block', fontSize:13, fontWeight:'bold', color:'#1976d2', marginBottom:8}}>CATEGORY</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{width:'100%', padding:12, border:'1px solid #ddd', borderRadius:12, fontSize:15, textAlign:'center', background:'#fafafa'}}>
                  <option value="wildlife">Wildlife</option>
                  <option value="damage">Damage</option>
                  <option value="flytipping">Fly-Tipping</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="critical">Critical</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{marginBottom:18}}>
                <label style={{display:'block', fontSize:13, fontWeight:'bold', color:'#1976d2', marginBottom:8}}>TITLE</label>
                <input placeholder="What did you see?" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{width:'100%', padding:12, border:'1px solid #ddd', borderRadius:12, fontSize:15, textAlign:'center', boxSizing:'border-box', background:'#fafafa'}} required />
              </div>

              <div style={{marginBottom:18}}>
                <label style={{display:'block', fontSize:13, fontWeight:'bold', color:'#1976d2', marginBottom:8}}>DESCRIPTION</label>
                <textarea placeholder="Describe what you observed..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{width:'100%', padding:12, border:'1px solid #ddd', borderRadius:12, fontSize:15, minHeight:80, textAlign:'center', boxSizing:'border-box', fontFamily:'inherit', background:'#fafafa'}} required />
              </div>

              <div style={{marginBottom:18}}>
                <label style={{display:'block', fontSize:13, fontWeight:'bold', color:'#1976d2', marginBottom:8}}>SEVERITY</label>
                <select value={formData.severity} onChange={(e) => setFormData({...formData, severity: e.target.value})} style={{width:'100%', padding:12, border:'1px solid #ddd', borderRadius:12, fontSize:15, textAlign:'center', background:'#fafafa'}}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div style={{background:'#f5f5f5', borderRadius:20, padding:18, marginBottom:18}}>
                <button type="button" onClick={getLocation} style={{background:'#1976d2', color:'white', border:'none', padding:'10px 24px', borderRadius:40, cursor:'pointer', fontSize:14, marginBottom:10}}>
                  {locationText}
                </button>
                {locationError && (
                  <div style={{color:'#f44336', fontSize:12, marginTop:8}}>
                    {locationError}
                  </div>
                )}
                {formData.lat && (
                  <div style={{background:'white', padding:12, borderRadius:12, fontSize:13, marginTop:10, color:'#555'}}>
                    {formData.lat.toFixed(6)}<br />
                    {formData.lng.toFixed(6)}
                  </div>
                )}
              </div>

              <div style={{background:'#f5f5f5', borderRadius:20, padding:18, marginBottom:18}}>
                <button type="button" onClick={takePhoto} style={{background:'#1976d2', color:'white', border:'none', padding:'10px 24px', borderRadius:40, cursor:'pointer', fontSize:14}}>
                  Take Photo
                </button>
                {formData.photo && (
                  <div style={{marginTop:14}}>
                    <img src={formData.photo} alt="preview" style={{maxWidth:'100%', maxHeight:150, borderRadius:12, objectFit:'contain'}} />
                    <div style={{marginTop:10}}>
                      <button type="button" onClick={() => setFormData({...formData, photo: null})} style={{background:'#ef5350', color:'white', border:'none', padding:'6px 20px', borderRadius:25, cursor:'pointer', fontSize:12}}>Remove</button>
                    </div>
                  </div>
                )}
                {!formData.photo && (
                  <div style={{background:'white', padding:12, borderRadius:12, fontSize:13, marginTop:10, color:'#999'}}>
                    No photo yet.
                  </div>
                )}
              </div>

              <button type="submit" style={{background:'#1976d2', color:'white', border:'none', padding:14, width:'100%', borderRadius:40, fontSize:16, fontWeight:'bold', cursor:'pointer', marginTop:8}}>
                {editingId ? 'Update Report' : 'Save Report'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
