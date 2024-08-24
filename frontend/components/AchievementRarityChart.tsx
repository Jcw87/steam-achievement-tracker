import Highcharts from 'highcharts';
import Highcharts3d from 'highcharts/highcharts-3d';
import HighchartsReact from "highcharts-react-official";
import { AchievementRarity } from "../api";

Highcharts3d(Highcharts);

export interface AchievementRarityChartProps {
  rarity: AchievementRarity;
}

export function AchievementRarityChart({rarity}: AchievementRarityChartProps) {
  const chartOptions: Highcharts.Options = {
    colors: [
      'var(--achievement-color-common)',
      'var(--achievement-color-uncommon)',
      'var(--achievement-color-rare)',
      'var(--achievement-color-epic)',
      'var(--achievement-color-legendary)',
    ],
    credits: {
      enabled: false,
    },
    chart: {
      renderTo: 'container',
      backgroundColor: 'rgba(42, 63, 90, 0.0)',
      type: 'pie',
      options3d: {
        enabled: true,
        alpha: 45,
        beta: 0,
      },
    },
    title: {
      text: 'Achievement Rarity',
      style: {color: 'white'},
    },
    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          formatter: function () {
            return Math.round(this.percentage * 100) / 100 + ' %';
          },
          // distance: 10,
          color: null,
          backgroundColor: 'rgba(80, 148, 193, 0.4)',
          borderRadius: 120,
        },
      },
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        depth: 35,
      },
    },
    series: [{
      type: "pie",
      name: "Total Achievements",
      data: [
        ['Common', rarity.common],
        ['Uncommon', rarity.uncommon],
        ['Rare', rarity.rare],
        ['Epic', rarity.epic],
        ['Legendary', rarity.legendary],
      ],
    }],
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={chartOptions}
    />
  );
}
