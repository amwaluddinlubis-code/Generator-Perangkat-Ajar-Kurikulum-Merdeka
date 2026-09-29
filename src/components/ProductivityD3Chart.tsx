import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MonthlyProductivityData } from '../types';
import { useTheme } from '../theme';

interface ProductivityD3ChartProps {
  data: MonthlyProductivityData[];
  selectedMetric: 'all' | 'modulAjar' | 'soalUjian' | 'rpp';
  chartType?: 'area' | 'bar';
}

export const ProductivityD3Chart: React.FC<ProductivityD3ChartProps> = ({
  data,
  selectedMetric,
  chartType = 'area'
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();
  const dark = theme === 'dark';
  // Palet netral Apple — mengikuti tema
  const ink = dark ? '#f5f5f7' : '#1d1d1f';
  const subtle = dark ? '#98989d' : '#6e6e73';
  const grid = dark ? 'rgba(255,255,255,0.12)' : '#e8e8ed';
  const dotBg = dark ? '#1c1c1e' : '#ffffff';
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data: MonthlyProductivityData | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    data: null
  });

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data || data.length === 0) return;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 600;
    const height = 300;
    const margin = { top: 25, right: 30, bottom: 40, left: 45 };
    const width = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg
      .attr('viewBox', `0 0 ${containerWidth} ${height}`)
      .attr('width', '100%')
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Helper to get value based on selectedMetric
    const getValue = (d: MonthlyProductivityData): number => {
      if (selectedMetric === 'modulAjar') return d.modulAjar;
      if (selectedMetric === 'soalUjian') return d.soalUjian;
      if (selectedMetric === 'rpp') return d.rpp;
      return d.total;
    };

    // Define Gradients
    const defs = svg.append('defs');

    // Area Gradient
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'productivity-area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', ink)
      .attr('stop-opacity', 0.28);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.02);

    // Bar Gradient
    const barGradient = defs
      .append('linearGradient')
      .attr('id', 'productivity-bar-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    barGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', ink);

    barGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', subtle);

    // X and Y Scales
    const xScale = d3
      .scaleBand()
      .domain(data.map(d => d.monthShort))
      .range([0, width])
      .padding(0.3);

    const maxValue = d3.max(data, d => getValue(d)) || 5;
    const yMax = Math.max(maxValue + 2, 6);

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([innerHeight, 0]);

    // Horizontal Grid Lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .call(g => g.select('.domain').remove())
      .call(g =>
        g
          .selectAll('.tick line')
          .attr('stroke', grid)
          .attr('stroke-dasharray', '3,3')
      );

    // Bottom Axis (Months)
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .call(g => g.select('.domain').attr('stroke', grid))
      .call(g =>
        g
          .selectAll('.tick text')
          .attr('fill', subtle)
          .attr('font-size', '11px')
          .attr('font-weight', '600')
          .attr('font-family', 'inherit')
      )
      .call(g => g.selectAll('.tick line').attr('stroke', grid));

    // Left Axis (Count)
    g.append('g')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickFormat(d => `${d}`)
      )
      .call(g => g.select('.domain').remove())
      .call(g =>
        g
          .selectAll('.tick text')
          .attr('fill', subtle)
          .attr('font-size', '11px')
          .attr('font-weight', '500')
          .attr('font-family', 'inherit')
      );

    // RENDER: Area Curve or Bar Chart
    if (chartType === 'area') {
      // Area generator
      const area = d3
        .area<MonthlyProductivityData>()
        .x(d => (xScale(d.monthShort) || 0) + xScale.bandwidth() / 2)
        .y0(innerHeight)
        .y1(d => yScale(getValue(d)))
        .curve(d3.curveMonotoneX);

      // Line generator
      const line = d3
        .line<MonthlyProductivityData>()
        .x(d => (xScale(d.monthShort) || 0) + xScale.bandwidth() / 2)
        .y(d => yScale(getValue(d)))
        .curve(d3.curveMonotoneX);

      // Append Area
      g.append('path')
        .datum(data)
        .attr('fill', 'url(#productivity-area-grad)')
        .attr('d', area);

      // Append Line
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', ink)
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('d', line);

      // Append Dots and Interactive Hover
      const dotsGroup = g.append('g');

      data.forEach(d => {
        const cx = (xScale(d.monthShort) || 0) + xScale.bandwidth() / 2;
        const cy = yScale(getValue(d));

        // Outer glow circle
        dotsGroup
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 6)
          .attr('fill', dotBg)
          .attr('stroke', ink)
          .attr('stroke-width', 2.5)
          .attr('class', 'cursor-pointer transition-all hover:scale-125')
          .on('mouseenter', (event) => {
            const [mouseX, mouseY] = d3.pointer(event, containerRef.current);
            setTooltip({
              visible: true,
              x: mouseX,
              y: mouseY,
              data: d
            });
          })
          .on('mouseleave', () => {
            setTooltip(prev => ({ ...prev, visible: false }));
          });

        // Small center dot
        dotsGroup
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 2.5)
          .attr('fill', ink)
          .attr('pointer-events', 'none');
      });

    } else {
      // Bar Chart mode
      g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar cursor-pointer transition-opacity hover:opacity-85')
        .attr('x', d => xScale(d.monthShort) || 0)
        .attr('y', d => yScale(getValue(d)))
        .attr('width', xScale.bandwidth())
        .attr('height', d => Math.max(0, innerHeight - yScale(getValue(d))))
        .attr('rx', 6)
        .attr('fill', 'url(#productivity-bar-grad)')
        .on('mouseenter', (event, d) => {
          const [mouseX, mouseY] = d3.pointer(event, containerRef.current);
          setTooltip({
            visible: true,
            x: mouseX,
            y: mouseY,
            data: d
          });
        })
        .on('mouseleave', () => {
          setTooltip(prev => ({ ...prev, visible: false }));
        });

      // Bar Value Labels
      g.selectAll('.bar-label')
        .data(data)
        .enter()
        .append('text')
        .attr('x', d => (xScale(d.monthShort) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(getValue(d)) - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', subtle)
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .text(d => getValue(d) > 0 ? getValue(d) : '');
    }

  }, [data, selectedMetric, chartType, theme, ink, subtle, grid, dotBg]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} className="overflow-visible w-full"></svg>

      {/* Floating D3 Tooltip */}
      {tooltip.visible && tooltip.data && (
        <div
          className="absolute z-20 pointer-events-none bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-sm transition-all transform -translate-x-1/2 -translate-y-full mb-3 min-w-[200px]"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 12}px`
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2">
            <span className="font-extrabold text-blue-300">
              {tooltip.data.month} {tooltip.data.year}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[10px] font-bold">
              {tooltip.data.total} Dokumen
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-300">
              <span>• Modul Ajar:</span>
              <b className="text-white">{tooltip.data.modulAjar}</b>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>• RPP Ringkas:</span>
              <b className="text-white">{tooltip.data.rpp}</b>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>• Bank Soal Ujian:</span>
              <b className="text-white">{tooltip.data.soalUjian}</b>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>• LKPD / ATP / P5:</span>
              <b className="text-white">{tooltip.data.lainnya}</b>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-emerald-300">
            <span>Rata-rata Waktu AI:</span>
            <b>~{tooltip.data.avgDurationMinutes} Menit</b>
          </div>
          <div className="text-[10px] text-amber-300 flex items-center justify-between mt-0.5">
            <span>Estimasi Hemat Kerja:</span>
            <b>~{(tooltip.data.total * 3.5).toFixed(1)} Jam</b>
          </div>
        </div>
      )}
    </div>
  );
};
