


// enerate XP over time line chart
export function generateXpChart(xpData, containerId = 'xp-chart') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  if (xpData.length === 0) {
    container.innerHTML = '<p>No XP data available</p>';
    return;
  }

  const dates = xpData.map(t => new Date(t.createdAt));
  const amounts = xpData.map(t => t.amount);
  const cumulativeXp = amounts.reduce((acc, curr, i) => {
    acc.push((acc[i - 1] || 0) + curr);
    return acc;
  }, []);

  const width = container.clientWidth;
  const height = 400;
  const margin = { top: 40, right: 30, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  chartGroup.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(chartGroup);

  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  const maxXp = Math.max(...cumulativeXp);

  const xScale = (date) => ((date - minDate) / (maxDate - minDate)) * innerWidth;
  const yScale = (value) => innerHeight - (value / maxXp) * innerHeight;

  // Draw smooth line
  const pathPoints = dates.map((d, i) => `${xScale(d)},${yScale(cumulativeXp[i])}`).join(' ');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  path.setAttribute('points', pathPoints);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#4a6fa5');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-linecap', 'round');
  chartGroup.appendChild(path);

  // Add dots
  dates.forEach((date, i) => {
    const cx = xScale(date);
    const cy = yScale(cumulativeXp[i]);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', '#4c9f70');
    chartGroup.appendChild(circle);

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${date.toISOString().split('T')[0]}: ${cumulativeXp[i]} XP`;
    circle.appendChild(title);
  });

  // X-axis
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', 0);
  xAxis.setAttribute('y1', innerHeight);
  xAxis.setAttribute('x2', innerWidth);
  xAxis.setAttribute('y2', innerHeight);
  xAxis.setAttribute('stroke', '#333');
  xAxis.setAttribute('stroke-width', '1');
  chartGroup.appendChild(xAxis);

  // Y-axis
  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', 0);
  yAxis.setAttribute('y1', 0);
  yAxis.setAttribute('x2', 0);
  yAxis.setAttribute('y2', innerHeight);
  yAxis.setAttribute('stroke', '#333');
  yAxis.setAttribute('stroke-width', '1');
  chartGroup.appendChild(yAxis);

  // Labels
  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', innerWidth / 2);
  xLabel.setAttribute('y', innerHeight + margin.bottom - 10);
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('font-size', '12');
  xLabel.textContent = 'Date';
  chartGroup.appendChild(xLabel);

  const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yLabel.setAttribute('x', -innerHeight / 2);
  yLabel.setAttribute('y', -margin.left + 15);
  yLabel.setAttribute('text-anchor', 'middle');
  yLabel.setAttribute('transform', 'rotate(-90)');
  yLabel.setAttribute('font-size', '12');
  yLabel.textContent = 'Cumulative XP';
  chartGroup.appendChild(yLabel);

  // Title
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

  if (!auditData || (auditData.up === 0 && auditData.down === 0)) {
    container.innerHTML = '<p>No audit data available</p>';
    return;
  }

  const width = container.clientWidth;
  const height = 400;
  const radius = Math.min(width, height) / 2 - 40;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${width / 2},${height / 2})`);
  svg.appendChild(g);

  const total = auditData.up + auditData.down;
  const upPercent = auditData.up / total;
  const downPercent = auditData.down / total;

  const upAngle = 360 * upPercent;

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

  // Draw slices
  g.appendChild(createSlice(0, upAngle, '#4c9f70'));         // Green for Up
  g.appendChild(createSlice(upAngle, 360, '#e74c3c'));       // Red for Down

  // Add "Up" percentage label inside green slice
  const upLabelAngle = upAngle / 2 - 90; // middle of Up slice
  const upX = (radius / 1.5) * Math.cos(upLabelAngle * Math.PI / 180);
  const upY = (radius / 1.5) * Math.sin(upLabelAngle * Math.PI / 180);

  const upText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  upText.setAttribute('x', upX);
  upText.setAttribute('y', upY);
  upText.setAttribute('text-anchor', 'middle');
  upText.setAttribute('font-size', '16');
  upText.setAttribute('font-weight', 'bold');
  upText.setAttribute('fill', 'white');
  upText.textContent = `Up: ${(upPercent * 100).toFixed(0)}%`;
  g.appendChild(upText);

  // Add "Down" percentage label inside red slice
  const downLabelAngle = upAngle + (360 - upAngle) / 2 - 90;
  const downX = (radius / 1.5) * Math.cos(downLabelAngle * Math.PI / 180);
  const downY = (radius / 1.5) * Math.sin(downLabelAngle * Math.PI / 180);

  const downText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  downText.setAttribute('x', downX);
  downText.setAttribute('y', downY);
  downText.setAttribute('text-anchor', 'middle');
  downText.setAttribute('font-size', '16');
  downText.setAttribute('font-weight', 'bold');
  downText.setAttribute('fill', 'white');
  downText.textContent = `Down: ${(downPercent * 100).toFixed(0)}%`;
  g.appendChild(downText);

  // Add title on top
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', width / 2);
  title.setAttribute('y', 30);
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('font-size', '16');
  title.setAttribute('font-weight', 'bold');
  title.textContent = 'Audit Ratio (Up/Down)';
  svg.appendChild(title);

  container.appendChild(svg);
}

// Generate grades bar chart

export function generateGradesChart(gradesData, containerId = 'grades-chart') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  container.style.overflowX = 'auto';
  container.style.overflowY = 'hidden';
  container.style.minHeight = '500px';

  // Deduplicate by project name (keep highest XP)
  const seen = new Map();
  gradesData.forEach(entry => {
    const name = entry.object?.name;
    if (!name) return;
    if (!seen.has(name) || entry.amount > seen.get(name).amount) {
      seen.set(name, entry);
    }
  });
  gradesData = Array.from(seen.values());

  if (gradesData.length === 0) {
    container.innerHTML = '<p>No project XP data available</p>';
    return;
  }

  const barWidth = 20;
  const barSpacing = 20;
  const padding = 60;
  const ticks = 5;

  const chartHeight = 400;
  const svgHeight = chartHeight + 60;
  const chartWidth = gradesData.length * (barWidth + barSpacing);
  const svgWidth = chartWidth + padding * 2;

  const maxXP = Math.max(...gradesData.map(d => d.amount));

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight);
  svg.style.display = 'block';

  const xAxisY = chartHeight;
  const yAxisX = padding;

  // Y-axis
  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', yAxisX);
  yAxis.setAttribute('x2', yAxisX);
  yAxis.setAttribute('y1', padding);
  yAxis.setAttribute('y2', xAxisY);
  yAxis.setAttribute('stroke', '#000');
  yAxis.setAttribute('stroke-width', '1.5');
  svg.appendChild(yAxis);

  // X-axis
  const lastBarEndX = yAxisX + gradesData.length * (barWidth + barSpacing) - barSpacing;
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', yAxisX);
  xAxis.setAttribute('x2', lastBarEndX + barWidth);
  xAxis.setAttribute('y1', xAxisY);
  xAxis.setAttribute('y2', xAxisY);
  xAxis.setAttribute('stroke', '#000');
  xAxis.setAttribute('stroke-width', '1.5');
  svg.appendChild(xAxis);

  // Y-axis ticks and labels
  for (let i = 0; i <= ticks; i++) {
    const value = Math.round((maxXP / ticks) * i);
    const y = xAxisY - (value / maxXP) * (chartHeight - padding);

    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tick.setAttribute('x1', yAxisX - 5);
    tick.setAttribute('x2', yAxisX);
    tick.setAttribute('y1', y);
    tick.setAttribute('y2', y);
    tick.setAttribute('stroke', '#000');
    svg.appendChild(tick);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', yAxisX - 10);
    label.setAttribute('y', y + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-size', '10');
    label.setAttribute('fill', '#333');
    label.textContent = formatbyKbs(value);
    svg.appendChild(label);
  }

  // Bars and labels
  gradesData.forEach((entry, index) => {
    const x = yAxisX + index * (barWidth + barSpacing);
    const barHeight = (entry.amount / maxXP) * (chartHeight - padding);
    const y = xAxisY - barHeight;

    // Bar
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', barWidth);
    rect.setAttribute('height', barHeight);
    rect.setAttribute('fill', '#4a6fa5');
    rect.style.cursor = 'pointer';

    // Tooltip on hover
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${entry.object?.name}: ${formatbyKbs(entry.amount)}`;
    rect.appendChild(title);

    svg.appendChild(rect);

    // XP label (hidden by default)
    const value = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    value.setAttribute('x', x + barWidth / 2);
    value.setAttribute('y', y - 5);
    value.setAttribute('text-anchor', 'middle');
    value.setAttribute('font-size', '10');
    value.setAttribute('fill', '#333');
    value.style.display = 'none';
    value.textContent = formatbyKbs(entry.amount);

    rect.addEventListener('mouseenter', () => value.style.display = 'block');
    rect.addEventListener('mouseleave', () => value.style.display = 'none');

    svg.appendChild(value);

    // Project name label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    label.setAttribute('x', x);
    label.setAttribute('y', xAxisY + 5);
    label.setAttribute('width', barWidth);
    label.setAttribute('height', 50);

    const div = document.createElement('div');
    div.style.fontSize = '10px';
    div.style.color = '#333';
    div.style.textAlign = 'center';
    div.style.wordWrap = 'break-word';
    div.style.overflowWrap = 'break-word';
    div.style.whiteSpace = 'normal';
    div.textContent = entry.object?.name || 'Unnamed';

    label.appendChild(div);
    svg.appendChild(label);
  });

  // Y-axis label
  const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yLabel.setAttribute('x', 20);
  yLabel.setAttribute('y', svgHeight / 2);
  yLabel.setAttribute('text-anchor', 'middle');
  yLabel.setAttribute('font-size', '12');
  yLabel.setAttribute('fill', '#333');
  yLabel.setAttribute('transform', `rotate(-90, 20, ${svgHeight / 2})`);
  yLabel.textContent = 'XP';
  svg.appendChild(yLabel);

  // X-axis label
  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', svgWidth / 2);
  xLabel.setAttribute('y', svgHeight - 5);
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('font-size', '12');
  xLabel.setAttribute('fill', '#333');
  xLabel.textContent = 'Project Name';
  svg.appendChild(xLabel);

  container.appendChild(svg);
}

export function formatbyKbs(bytes) {
  if (bytes >= 1000 * 1000) {
    return Math.round(bytes / (1000 * 1000)) + ' MB';
  } else if (bytes >= 1000) {
    return Math.round(bytes / 1000) + ' kB';
  } else {
    return bytes + ' B';
  }
}