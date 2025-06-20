// Generate XP over time line chart
export function generateXpChart(xpData, containerId = 'xp-chart') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  if (xpData.length === 0) {
    container.innerHTML = '<p>No XP data available</p>';
    return;
  }
  
  // Process data
  const dates = xpData.map(t => new Date(t.createdAt));
  const amounts = xpData.map(t => t.amount);
  const cumulativeXp = amounts.reduce((acc, curr, i) => {
    acc.push((acc[i-1] || 0) + curr);
    return acc;
  }, []);
  
  // Chart dimensions
  const width = container.clientWidth;
  const height = 400;
  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  // Create SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  
  // Create group for chart area
  const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  chartGroup.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(chartGroup);
  
  // Calculate scales
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const maxXp = Math.max(...cumulativeXp);
  
  const xScale = (date) => {
    return (date - minDate) / (maxDate - minDate) * innerWidth;
  };
  
  const yScale = (value) => {
    return innerHeight - (value / maxXp) * innerHeight;
  };
  
  // Create line path
  let pathData = `M ${xScale(dates[0])} ${yScale(cumulativeXp[0])}`;
  for (let i = 1; i < dates.length; i++) {
    pathData += ` L ${xScale(dates[i])} ${yScale(cumulativeXp[i])}`;
  }
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathData);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#4a6fa5');
  path.setAttribute('stroke-width', '3');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-linecap', 'round');
  chartGroup.appendChild(path);
  
  // Add circles at data points
  dates.forEach((date, i) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', xScale(date));
    circle.setAttribute('cy', yScale(cumulativeXp[i]));
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', '#4a6fa5');
    circle.setAttribute('data-xp', cumulativeXp[i]);
    circle.setAttribute('data-date', date.toISOString().split('T')[0]);
    chartGroup.appendChild(circle);
    
    // Add hover effect
    circle.addEventListener('mouseover', () => {
      const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tooltip.setAttribute('x', xScale(date) + 10);
      tooltip.setAttribute('y', yScale(cumulativeXp[i]) - 10);
      tooltip.setAttribute('font-size', '12');
      tooltip.setAttribute('fill', '#333');
      tooltip.textContent = `${cumulativeXp[i]} XP`;
      tooltip.setAttribute('class', 'tooltip');
      chartGroup.appendChild(tooltip);
      
      circle.setAttribute('r', '6');
    });
    
    circle.addEventListener('mouseout', () => {
      const tooltips = chartGroup.querySelectorAll('.tooltip');
      tooltips.forEach(t => t.remove());
      circle.setAttribute('r', '4');
    });
  });
  
  // Add X axis
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', '0');
  xAxis.setAttribute('y1', innerHeight);
  xAxis.setAttribute('x2', innerWidth);
  xAxis.setAttribute('y2', innerHeight);
  xAxis.setAttribute('stroke', '#333');
  xAxis.setAttribute('stroke-width', '1');
  chartGroup.appendChild(xAxis);
  
  // Add Y axis
  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', '0');
  yAxis.setAttribute('y1', '0');
  yAxis.setAttribute('x2', '0');
  yAxis.setAttribute('y2', innerHeight);
  yAxis.setAttribute('stroke', '#333');
  yAxis.setAttribute('stroke-width', '1');
  chartGroup.appendChild(yAxis);
  
  // Add X axis labels
  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', innerWidth / 2);
  xLabel.setAttribute('y', innerHeight + margin.bottom - 10);
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('font-size', '12');
  xLabel.textContent = 'Date';
  chartGroup.appendChild(xLabel);
  
  // Add Y axis labels
  const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yLabel.setAttribute('x', -innerHeight / 2);
  yLabel.setAttribute('y', -margin.left + 15);
  yLabel.setAttribute('text-anchor', 'middle');
  yLabel.setAttribute('transform', 'rotate(-90)');
  yLabel.setAttribute('font-size', '12');
  yLabel.textContent = 'Total XP';
  chartGroup.appendChild(yLabel);
  
  // Add chart title
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', innerWidth / 2);
  title.setAttribute('y', -10);
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('font-size', '14');
  title.setAttribute('font-weight', 'bold');
  title.textContent = 'Cumulative XP Over Time';
  chartGroup.appendChild(title);
  
  container.appendChild(svg);
}

// Generate audit ratio pie chart
export function generateAuditChart(auditData, containerId = 'audit-chart') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!auditData || auditData.up === 0 && auditData.down === 0) {
    container.innerHTML = '<p>No audit data available</p>';
    return;
  }
  
  // Chart dimensions
  const width = container.clientWidth;
  const height = 400;
  const radius = Math.min(width, height) / 2 - 40;
  
  // Create SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  
  // Center the pie chart
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${width / 2},${height / 2})`);
  svg.appendChild(g);
  
  // Calculate angles
  const total = auditData.up + auditData.down;
  const upPercent = auditData.up / total;
  const downPercent = auditData.down / total;
  
  // Create pie slices
  function createSlice(startAngle, endAngle, color) {
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = radius * Math.cos(startRad);
    const y1 = radius * Math.sin(startRad);
    const x2 = radius * Math.cos(endRad);
    const y2 = radius * Math.sin(endRad);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    const pathData = [
      `M 0 0`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', color);
    path.setAttribute('stroke', '#fff');
    path.setAttribute('stroke-width', '2');
    
    return path;
  }
  
  // Up votes slice
  const upAngle = 360 * upPercent;
  g.appendChild(createSlice(0, upAngle, '#4c9f70'));
  
  // Down votes slice
  g.appendChild(createSlice(upAngle, 360, '#e74c3c'));
  
  // Add center text
  const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  centerText.setAttribute('text-anchor', 'middle');
  centerText.setAttribute('font-size', '16');
  centerText.setAttribute('font-weight', 'bold');
  centerText.textContent = `${upPercent.toFixed(2)}:${downPercent.toFixed(2)}`;
  g.appendChild(centerText);
  
  // Add legend
  const legendY = height / 2 - 30;
  
  // Up legend
  const upLegend = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  upLegend.setAttribute('x', -width / 4);
  upLegend.setAttribute('y', legendY);
  upLegend.setAttribute('text-anchor', 'middle');
  upLegend.setAttribute('fill', '#4c9f70');
  upLegend.setAttribute('font-size', '14');
  upLegend.textContent = `Up: ${auditData.up}`;
  svg.appendChild(upLegend);
  
  // Down legend
  const downLegend = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  downLegend.setAttribute('x', width / 4);
  downLegend.setAttribute('y', legendY);
  downLegend.setAttribute('text-anchor', 'middle');
  downLegend.setAttribute('fill', '#e74c3c');
  downLegend.setAttribute('font-size', '14');
  downLegend.textContent = `Down: ${auditData.down}`;
  svg.appendChild(downLegend);
  
  // Add title
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', width / 2);
  title.setAttribute('y', 30);
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('font-size', '16');
  title.setAttribute('font-weight', 'bold');
  title.textContent = 'Audit Ratio (Up:Down)';
  svg.appendChild(title);
  
  container.appendChild(svg);
}

// Generate project grades bar chart
export function generateGradesChart(gradesData, containerId = 'grades-chart') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  if (gradesData.length === 0) {
    container.innerHTML = '<p>No project grades data available</p>';
    return;
  }
  
  // Chart dimensions
  const width = container.clientWidth;
  const height = 400;
  const margin = { top: 30, right: 30, bottom: 70, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  // Create SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  
  // Create group for chart area
  const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  chartGroup.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(chartGroup);
  
  // Calculate scales
  const barWidth = innerWidth / gradesData.length;
  const maxGrade = Math.max(...gradesData.map(g => g.grade));
  
  const yScale = (value) => {
    return innerHeight - (value / maxGrade) * innerHeight;
  };
  
  // Create bars
  gradesData.forEach((grade, i) => {
    const barHeight = innerHeight - yScale(grade.grade);
    const x = i * barWidth;
    const y = yScale(grade.grade);
    
    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bar.setAttribute('x', x);
    bar.setAttribute('y', y);
    bar.setAttribute('width', barWidth - 2);
    bar.setAttribute('height', barHeight);
    bar.setAttribute('fill', grade.grade >= 50 ? '#4c9f70' : '#e74c3c');
    chartGroup.appendChild(bar);
    
    // Add grade label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x + barWidth / 2);
    label.setAttribute('y', y - 5);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '12');
    label.textContent = grade.grade;
    chartGroup.appendChild(label);
    
    // Add project label
    const date = new Date(grade.createdAt);
    const projectLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    projectLabel.setAttribute('x', x + barWidth / 2);
    projectLabel.setAttribute('y', innerHeight + 15);
    projectLabel.setAttribute('text-anchor', 'middle');
    projectLabel.setAttribute('font-size', '10');
    projectLabel.setAttribute('transform', `rotate(45, ${x + barWidth / 2}, ${innerHeight + 15})`);
    projectLabel.textContent = date.toISOString().split('T')[0];
    chartGroup.appendChild(projectLabel);
  });
  
  // Add X axis
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', '0');
  xAxis.setAttribute('y1', innerHeight);
  xAxis.setAttribute('x2', innerWidth);
  xAxis.setAttribute('y2', innerHeight);
  xAxis.setAttribute('stroke', '#333');
  xAxis.setAttribute('stroke-width', '1');
  chartGroup.appendChild(xAxis);
  
  // Add Y axis
  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', '0');
  yAxis.setAttribute('y1', '0');
  yAxis.setAttribute('x2', '0');
  yAxis.setAttribute('y2', innerHeight);
  yAxis.setAttribute('stroke', '#333');
  yAxis.setAttribute('stroke-width', '1');
  chartGroup.appendChild(yAxis);
  
  // Add Y axis labels
  for (let i = 0; i <= maxGrade; i += 20) {
    const y = yScale(i);
    
    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tick.setAttribute('x1', '0');
    tick.setAttribute('y1', y);
    tick.setAttribute('x2', '-5');
    tick.setAttribute('y2', y);
    tick.setAttribute('stroke', '#333');
    tick.setAttribute('stroke-width', '1');
    chartGroup.appendChild(tick);
    
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', '-10');
    label.setAttribute('y', y + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-size', '10');
    label.textContent = i;
    chartGroup.appendChild(label);
  }
  
  // Add chart title
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', innerWidth / 2);
  title.setAttribute('y', -10);
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('font-size', '14');
  title.setAttribute('font-weight', 'bold');
  title.textContent = 'Project Grades';
  chartGroup.appendChild(title);
  
  container.appendChild(svg);
}