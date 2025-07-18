import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const JobApplicants = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get job ID from URL
  const [applicants, setApplicants] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchApplicants();
    }
  }, [id]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
    //   if (!token) {
    //     navigate('/login/hr');
    //     return;
    //   }

      const response = await axios.get(`/api/job/${id}/applicants`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Applicants API Response:', response.data);
      
      if (response.data?.data?.applicants) {
        setApplicants(response.data.data.applicants);
        
        // Extract job details from the first applicant if available
        if (response.data.data.applicants.length > 0 && response.data.data.applicants[0].jobApplied) {
          setJobDetails(response.data.data.applicants[0].jobApplied);
        }
      } else {
        setApplicants([]);
      }
      
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setError(error.response?.data?.message || 'Failed to fetch applicants');
      
      if (error.response?.status === 401) {
        navigate('/login/hr');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = (filePath, candidateName) => {
    // Create a download link for the CV
    const link = document.createElement('a');
    link.href = filePath;
    link.download = `${candidateName}_CV.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSkillMatchPercentage = (candidateSkills, jobRequiredSkills) => {
    if (!candidateSkills || !jobRequiredSkills || candidateSkills.length === 0 || jobRequiredSkills.length === 0) {
      return 0;
    }
    
    const matchedSkills = candidateSkills.filter(skill => 
      jobRequiredSkills.some(reqSkill => 
        reqSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(reqSkill.toLowerCase())
      )
    );
    
    return Math.round((matchedSkills.length / jobRequiredSkills.length) * 100);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <div className="d-flex" style={{ height: '100vh' }}>
      {/* Sidebar */}
      <div className="bg-primary text-white p-3" style={{ width: '260px' }}>
        <div className="text-center mb-4">
          <h6 className="text-white">ATS Dashboard</h6>
        </div>

        <div className="d-grid gap-3">
          <button className="btn text-white text-start text-center" onClick={() => navigate('/dashboard')}>
            <i className="bi bi-speedometer2 me-2"></i>Dashboard
          </button>
          <button className="btn btn-light text-dark fw-bold" onClick={() => navigate('/postedJobs')}>
            <i className="bi bi-briefcase me-2"></i>Jobs
          </button>
          <button className="btn text-white text-start text-center" onClick={() => navigate('/resumeUpload')}>
            <i className="bi bi-file-earmark-arrow-up me-2"></i>Resume Upload
          </button>
          <button className="btn text-white text-start text-center" onClick={() => navigate('/screening')}>
            <i className="bi bi-funnel me-2"></i>Screening
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-grow-1 p-4 bg-light">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <button 
              className="btn btn-outline-primary me-3"
              onClick={() => navigate('/postedJobs')}
            >
              <i className="bi bi-arrow-left me-2"></i>Back to Jobs
            </button>
            <h4 className="d-inline">
              Job Applicants
              {jobDetails && (
                <span className="text-muted ms-2">- {jobDetails.title}</span>
              )}
            </h4>
          </div>
          {!loading && !error && (
            <span className="badge bg-primary fs-6">
              {applicants.length} {applicants.length === 1 ? 'Applicant' : 'Applicants'}
            </span>
          )}
        </div>

        {/* Job Details Card */}
        {jobDetails && (
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <h5 className="card-title text-primary">{jobDetails.title}</h5>
                  <p className="text-muted mb-0">
                    <i className="bi bi-geo-alt me-2"></i>
                    {jobDetails.location}
                  </p>
                </div>
                <div className="col-md-4 text-end">
                  <small className="text-muted">Job ID: {id}</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading applicants...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Applicants List */}
        {!loading && !error && applicants.length > 0 && (
          <div className="row">
            {applicants.map((applicant, index) => (
              <div key={applicant._id} className="col-12 mb-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="row align-items-center">
                      {/* Applicant Info */}
                      <div className="col-md-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                               style={{ width: '50px', height: '50px' }}>
                            <span className="text-white fw-bold">
                              {applicant.fullName?.charAt(0)?.toUpperCase() || 'N'}
                            </span>
                          </div>
                          <div>
                            <h6 className="mb-1">{applicant.fullName || 'Unknown'}</h6>
                            <small className="text-muted">{applicant.email || 'No email'}</small>
                            {applicant.phone && (
                              <div>
                                <small className="text-muted">
                                  <i className="bi bi-telephone me-1"></i>
                                  {applicant.phone}
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Skills & Experience */}
                      <div className="col-md-4">
                        <div className="mb-2">
                          <small className="text-muted">
                            <i className="bi bi-briefcase me-1"></i>
                            Experience: {applicant.experience || 'Not specified'}
                          </small>
                        </div>
                        {applicant.skills && applicant.skills.length > 0 && (
                          <div>
                            <small className="text-muted">
                              <i className="bi bi-tools me-1"></i>
                              Skills:
                            </small>
                            <div className="mt-1">
                              {applicant.skills.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="badge bg-light text-dark me-1 mb-1">
                                  {skill}
                                </span>
                              ))}
                              {applicant.skills.length > 3 && (
                                <span className="badge bg-secondary">
                                  +{applicant.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Score & Match */}
                      <div className="col-md-2 text-center">
                        <div className="mb-2">
                          <span className={`badge ${getScoreBadge(applicant.skillMatch || 0)} fs-6`}>
                            {applicant.skillMatch || 0}%
                          </span>
                          <div>
                            <small className="text-muted">Skill Match</small>
                          </div>
                        </div>
                        <div className="mb-1">
                          <span className={`badge ${applicant.status === 'Selected' ? 'bg-success' : applicant.status === 'Rejected' ? 'bg-danger' : 'bg-warning'}`}>
                            {applicant.status || 'Applied'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-md-3 text-end">
                        <div className="d-flex justify-content-end align-items-center">
                          <div className="me-3">
                            <small className="text-muted">
                              Applied: {new Date(applicant.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                          <div className="btn-group">
                            {applicant.uploadedResume && (
                              <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleDownloadCV(applicant.uploadedResume, applicant.fullName)}
                                title="Download Resume"
                              >
                                <i className="bi bi-download"></i>
                              </button>
                            )}
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => navigate(`/applicant/${applicant._id}`)}
                              title="View Details"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="row mt-3">
                      <div className="col-md-6">
                        {applicant.qualification && (
                          <small className="text-muted">
                            <i className="bi bi-mortarboard me-1"></i>
                            Education: {applicant.qualification}
                          </small>
                        )}
                      </div>
                      <div className="col-md-6 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          {applicant.linkedin && (
                            <a 
                              href={applicant.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-outline-primary btn-sm"
                            >
                              <i className="bi bi-linkedin"></i>
                            </a>
                          )}
                          {applicant.github && (
                            <a 
                              href={applicant.github} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-outline-dark btn-sm"
                            >
                              <i className="bi bi-github"></i>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Applicants State */}
        {!loading && !error && applicants.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-people display-1 text-muted"></i>
            <h4 className="mt-3 text-muted">No applicants yet</h4>
            <p className="text-muted">
              This job posting hasn't received any applications yet. Share your job posting to attract candidates!
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/postedJobs')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplicants;
