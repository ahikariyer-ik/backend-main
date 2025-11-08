import dynamic from 'next/dynamic'

import type { Props as ReactApexChartsProps } from 'react-apexcharts'

const AppReactApexCharts = dynamic<ReactApexChartsProps>(() => import('react-apexcharts'), {
  ssr: false
})

export default AppReactApexCharts
