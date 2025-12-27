import React, { useState, useEffect } from 'react';
import { posReportsAPI, posCancellationAPI } from '../services/api';
import './POSReports.css';

const POSReports = () => {
  const [activeReport, setActiveReport] = useState('daily-closing');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pendingCancellations, setPendingCancellations] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    loadPendingCancellations();
  }, []);

  const loadPendingCancellations = async () => {
    try {
      const response = await posCancellationAPI.getPending();
      setPendingCancellations(response.data);
    } catch (error) {
      console.error('Error loading pending cancellations:', error);
    }
  };

  const loadReport = async () => {
    setLoading(true);
    setReportData(null);
    
    try {
      let response;
      const params = {};
      
      switch (activeReport) {
        case 'promotional':
          params.startDate = startDate;
          params.endDate = endDate;
          response = await posReportsAPI.getPromotional(params);
          break;
        case 'waste':
          params.startDate = startDate;
          params.endDate = endDate;
          response = await posReportsAPI.getWaste(params);
          break;
        case 'daily-closing':
          params.date = date;
          response = await posReportsAPI.getDailyClosing(params);
          break;
        case 'monthly':
          params.year = year;
          params.month = month;
          response = await posReportsAPI.getMonthly(params);
          break;
        case 'change-payment':
          params.startDate = startDate;
          params.endDate = endDate;
          response = await posReportsAPI.getChangePayment(params);
          break;
        case 'guest-common':
          params.startDate = startDate;
          params.endDate = endDate;
          response = await posReportsAPI.getGuestCommon(params);
          break;
        case 'move-table':
          params.startDate = startDate;
          params.endDate = endDate;
          response = await posReportsAPI.getMoveTable(params);
          break;
        case 'branch-menu':
          params.startDate = startDate;
          params.endDate = endDate;
          response = await posReportsAPI.getBranchMenu(params);
          break;
        default:
          return;
      }
      
      setReportData(response.data);
    } catch (error) {
      console.error('Error loading report:', error);
      alert('Error loading report');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCancellation = async (id) => {
    if (!window.confirm('Approve this cancellation request?')) return;
    
    try {
      const posUserData = localStorage.getItem('posUser');
      const posUser = posUserData ? JSON.parse(posUserData) : { username: 'manager' };
      await posCancellationAPI.approve(id, { approvedBy: posUser.username || 'manager' });
      alert('Cancellation approved');
      loadPendingCancellations();
      if (reportData) {
        loadReport();
      }
    } catch (error) {
      console.error('Error approving cancellation:', error);
      alert(error.response?.data?.error || 'Error approving cancellation');
    }
  };

  const handleRejectCancellation = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      const posUserData = localStorage.getItem('posUser');
      const posUser = posUserData ? JSON.parse(posUserData) : { username: 'manager' };
      await posCancellationAPI.reject(id, { 
        rejectedBy: posUser.username || 'manager',
        rejectionReason: reason 
      });
      alert('Cancellation rejected');
      loadPendingCancellations();
    } catch (error) {
      console.error('Error rejecting cancellation:', error);
      alert(error.response?.data?.error || 'Error rejecting cancellation');
    }
  };

  const exportReport = () => {
    if (!reportData) return;
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeReport}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const reports = [
    { id: 'daily-closing', name: 'Daily Closing Report', needsDate: true },
    { id: 'monthly', name: 'Monthly POS Report', needsYearMonth: true },
    { id: 'promotional', name: 'Promotional Report', needsDateRange: true },
    { id: 'waste', name: 'Waste Report', needsDateRange: true },
    { id: 'change-payment', name: 'Change Payment Report', needsDateRange: true },
    { id: 'guest-common', name: 'Guest Common Report', needsDateRange: true },
    { id: 'move-table', name: 'Move Table Report', needsDateRange: true },
    { id: 'branch-menu', name: 'Branch Menu Report', needsDateRange: true }
  ];

  return (
    <div className="pos-reports-page">
      <div className="page-header">
        <h1 className="page-title">POS Reports</h1>
        <p className="page-subtitle">View and manage POS reports</p>
      </div>

      {/* Pending Cancellations */}
      {pendingCancellations.length > 0 && (
        <div className="card" style={{ marginBottom: '20px', background: '#FEF3C7' }}>
          <div className="card-header">
            <h3>Pending Cancellation Requests ({pendingCancellations.length})</h3>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Requested By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingCancellations.map(cancel => (
                  <tr key={cancel.id}>
                    <td>{cancel.orderNumber}</td>
                    <td>{cancel.productName}</td>
                    <td>{cancel.quantity}</td>
                    <td>Rp {cancel.amount.toLocaleString('id-ID')}</td>
                    <td>{cancel.reason}</td>
                    <td>{cancel.requestedBy}</td>
                    <td>
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleApproveCancellation(cancel.id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRejectCancellation(cancel.id)}
                        style={{ marginLeft: '5px' }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="reports-container">
        <div className="reports-sidebar">
          <h3>Select Report</h3>
          {reports.map(report => (
            <button
              key={report.id}
              className={`report-btn ${activeReport === report.id ? 'active' : ''}`}
              onClick={() => setActiveReport(report.id)}
            >
              {report.name}
            </button>
          ))}
        </div>

        <div className="reports-content">
          <div className="card">
            <div className="card-header">
              <h3>{reports.find(r => r.id === activeReport)?.name}</h3>
            </div>
            
            <div className="report-filters">
              {reports.find(r => r.id === activeReport)?.needsDate && (
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="form-control"
                  />
                </div>
              )}
              
              {reports.find(r => r.id === activeReport)?.needsYearMonth && (
                <>
                  <div className="form-group">
                    <label>Year</label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                      className="form-control"
                      min="2020"
                      max="2099"
                    />
                  </div>
                  <div className="form-group">
                    <label>Month</label>
                    <input
                      type="number"
                      value={month}
                      onChange={(e) => setMonth(parseInt(e.target.value))}
                      className="form-control"
                      min="1"
                      max="12"
                    />
                  </div>
                </>
              )}
              
              {reports.find(r => r.id === activeReport)?.needsDateRange && (
                <>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </>
              )}
              
              <button className="btn btn-primary" onClick={loadReport} disabled={loading}>
                {loading ? 'Loading...' : 'Generate Report'}
              </button>
              
              {reportData && (
                <button className="btn btn-outline" onClick={exportReport}>
                  Export JSON
                </button>
              )}
            </div>

            {loading && <div>Loading report...</div>}
            
            {reportData && (
              <div className="report-results">
                <pre>{JSON.stringify(reportData, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSReports;

