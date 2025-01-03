
import React, { useState, useEffect } from 'react';
import styles from './FormAnalytics.module.css';
import { getFormAnalytics, getFormResponses, getFormElements } from '../services/api';

const FormAnalytics = ({ formId, isDarkMode }) => {
  const [analytics, setAnalytics] = useState({
    viewCount: 0,
    startCount: 0,
    completionCount: 0,
    completionRate: 0
  });
  const [submissions, setSubmissions] = useState([]);
  const [formElements, setFormElements] = useState({});
  const [loading, setLoading] = useState(true);
  const [hasResponses, setHasResponses] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const elementsResponse = await getFormElements(formId);
        
        const elementMapping = {};
        elementsResponse.forEach(element => {
          if (
            element &&
            element._id &&
            element.type !== 'text-bubble' &&
            element.type !== 'image-bubble' &&
            element.type !== 'video-bubble' &&
            element.type !== 'gif-bubble'&&
            element.type!=='button-input'
          ) {
            elementMapping[element._id] = {
              label: element.label || `Question ${element.order + 1}`,
              type: element.type,
              order: element.order
            };
          }
        });
        
        setFormElements(elementMapping);

        const [analyticsResponse, responsesData] = await Promise.all([
          getFormAnalytics(formId),
          getFormResponses(formId, 1, 10, 'completed')
        ]);

        const hasAnyResponses = analyticsResponse?.viewCount > 0 || 
                              analyticsResponse?.startCount > 0 || 
                              analyticsResponse?.completionCount > 0 ||
                              (responsesData?.responses && responsesData.responses.length > 0);

        setHasResponses(hasAnyResponses);

        if (!hasAnyResponses) {
          setLoading(false);
          return;
        }

        setAnalytics({
          viewCount: analyticsResponse?.viewCount || 0,
          startCount: analyticsResponse?.startCount || 0,
          completionCount: analyticsResponse?.completionCount || 0,
          completionRate: Math.round((analyticsResponse?.completionCount / analyticsResponse?.startCount) * 100) || 0
        });

        const transformedSubmissions = Array.isArray(responsesData?.responses) 
          ? responsesData.responses.map((response) => ({
              submittedAt: new Date(response.completedAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }),
              ...response.responses
            }))
          : [];

        setSubmissions(transformedSubmissions);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (formId) fetchData();
  }, [formId]);

  if (loading) {
    return (
      <div className={`${styles.loading} ${isDarkMode ? styles.dark : styles.light}`}>
        Loading...
      </div>
    );
  }

  if (!hasResponses) {
    return (
      <div className={`${styles.container} ${isDarkMode ? styles.dark : styles.light}`}>
        <div className={styles.emptyState}>
          No responses yet collected
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.dark : styles.light}`}>
      <div className={styles.content}>
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Views</div>
            <div className={styles.statValue}>{analytics.viewCount}</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Starts</div>
            <div className={styles.statValue}>{analytics.startCount}</div>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>#</th>
                <th className={styles.tableHeader}>Submitted at</th>
                {Object.entries(formElements)
                  .sort(([, a], [, b]) => a.order - b.order)
                  .map(([id, element]) => (
                    <th key={id} className={styles.tableHeader}>
                      {element.type}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission, index) => (
                <tr key={index} className={styles.tableRow}>
                  <td className={styles.tableCell}>{index + 1}</td>
                  <td className={styles.tableCell}>{submission.submittedAt}</td>
                  {Object.entries(formElements)
                    .sort(([, a], [, b]) => a.order - b.order)
                    .map(([id]) => (
                      <td key={id} className={styles.tableCell}>
                        {submission[id] || '-'}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.completionContainer}>
          <div className={styles.donutChartContainer}>
            <svg viewBox="0 0 36 36" className={styles.donutChart}>
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className={styles.donutRing}
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                className={styles.donutSegment}
                strokeDasharray={`${analytics.completionRate} 100`}
              />
            </svg>
            <div className={styles.completionOverlay}>
              <div className={styles.completedLabel}>
                Completed
                <div className={styles.completedValue}>{analytics.completionCount}</div>
              </div>
            </div>
          </div>
          <div className={styles.completionRate}>
            <div className={styles.completionRateLabel}>Completion rate</div>
            <div className={styles.completionRateValue}>{analytics.completionRate}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormAnalytics;