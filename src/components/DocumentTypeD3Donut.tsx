import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '../theme';

interface DocumentTypeD3DonutProps {
  data: { label: string; count: number; color: string }[];
}

export const DocumentTypeD3Donut: React.FC<DocumentTypeD3DonutProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const ink = dark ? '#f5f5f7' : '#1d1d1f';
  const subtle = dark ? '#98989d' : '#6e6e73';
  const track = dark ? 'rgba(255,255,255,0.12)' : '#e8e8ed';

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 220;
    const height = 220;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.62;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const validData = data.filter(d => d.count > 0);
    const totalCount = d3.sum(data, d => d.count);

    if (validData.length === 0) {
      // Empty state
      g.append('circle')
        .attr('r', radius - 10)
        .attr('fill', 'none')
        .attr('stroke', track)
        .attr('stroke-width', 16);

      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .attr('fill', subtle)
        .attr('font-size', '12px')
        .text('Belum ada data');
      return;
    }

    const pie = d3
      .pie<{ label: string; count: number; color: string }>()
      .value(d => d.count)
      .sort(null)
      .padAngle(0.04);

    const arc = d3
      .arc<d3.PieArcDatum<{ label: string; count: number; color: string }>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 10)
      .cornerRadius(6);

    const arcs = g
      .selectAll('.arc')
      .data(pie(validData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('class', 'transition-all hover:opacity-85 cursor-pointer');

    // Center text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('fill', ink)
      .attr('font-size', '24px')
      .attr('font-weight', '700')
      .text(totalCount);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.3em')
      .attr('fill', subtle)
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('Perangkat Ajar');

  }, [data, theme, ink, subtle, track]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="w-48 h-48 shrink-0">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>

      <div className="space-y-2 w-full text-[13px]">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="font-medium truncate max-w-[150px]">{item.label}</span>
            </div>
            <span className="font-semibold bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full text-[12px]">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
