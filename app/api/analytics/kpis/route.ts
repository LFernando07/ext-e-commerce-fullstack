import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const propertyId = process.env.GA_PROPERTY_ID;
    const clientEmail = process.env.GA_CLIENT_EMAIL;
    const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!propertyId || !clientEmail || !privateKey) {
      console.error('Faltan variables de GA4 en .env.local');
      return NextResponse.json(
        { error: 'Configuración incompleta en .env.local' },
        { status: 500 }
      );
    }

    const analyticsClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });

    let totalViews = 0;
    let activeUsers = 0;
    let scrollBottomCount = 0;
    let leadsCount = 0;

    // 1. Reporte Histórico (días anteriores ya procesados)
    try {
      const [trafficReport] = await analyticsClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'activeUsers' },
        ],
      });

      totalViews = Number(trafficReport.rows?.[0]?.metricValues?.[0]?.value || 0);
      activeUsers = Number(trafficReport.rows?.[0]?.metricValues?.[1]?.value || 0);

      const [eventsReport] = await analyticsClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: {
          filter: {
            fieldName: 'eventName',
            inListFilter: {
              values: ['scroll_bottom', 'generate_lead'],
            },
          },
        },
      });

      eventsReport.rows?.forEach((row) => {
        const eventName = row.dimensionValues?.[0]?.value;
        const count = Number(row.metricValues?.[0]?.value || 0);

        if (eventName === 'scroll_bottom') scrollBottomCount = count;
        if (eventName === 'generate_lead') leadsCount = count;
      });
    } catch (err) {
      console.warn('El reporte histórico aún no tiene datos procesados:', err);
    }

    // 2. Reporte en Tiempo Real (últimos 30 minutos)
    // GA4 tarda 24 a 48 horas en procesar datos al reporte histórico.
    // El reporte en tiempo real contiene los eventos que ves en vivo en tu panel de GA4.
    try {
      const [realtimeReport] = await analyticsClient.runRealtimeReport({
        property: `properties/${propertyId}`,
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
      });

      let rtViews = 0;
      let rtScroll = 0;
      let rtLeads = 0;

      realtimeReport.rows?.forEach((row) => {
        const eventName = row.dimensionValues?.[0]?.value;
        const count = Number(row.metricValues?.[0]?.value || 0);

        if (eventName === 'page_view') rtViews += count;
        if (eventName === 'scroll_bottom') rtScroll += count;
        if (eventName === 'generate_lead') rtLeads += count;
      });

      // Si el histórico aún no ha procesado las métricas de hoy, usamos las de tiempo real
      if (totalViews === 0 || rtViews > totalViews) totalViews = rtViews;
      if (scrollBottomCount === 0 || rtScroll > scrollBottomCount) scrollBottomCount = rtScroll;
      if (leadsCount === 0 || rtLeads > leadsCount) leadsCount = rtLeads;

      // Usuarios activos en tiempo real
      const [realtimeUsers] = await analyticsClient.runRealtimeReport({
        property: `properties/${propertyId}`,
        metrics: [{ name: 'activeUsers' }],
      });
      const rtActiveUsers = Number(realtimeUsers.rows?.[0]?.metricValues?.[0]?.value || 0);
      if (activeUsers === 0 || rtActiveUsers > activeUsers) {
        activeUsers = rtActiveUsers;
      }
    } catch (err) {
      console.warn('Aviso al consultar reporte en tiempo real:', err);
    }

    // Calcular tasa de retención / lectura completa
    const retentionRate = totalViews > 0
      ? ((scrollBottomCount / totalViews) * 100).toFixed(1)
      : '0.0';

    return NextResponse.json({
      totalViews,
      activeUsers,
      scrollBottomCount,
      leadsCount,
      retentionRate: `${retentionRate}%`,
    });
  } catch (error) {
    console.error('Error GA4 API:', error);
    return NextResponse.json(
      { error: 'No se pudieron consultar las métricas' },
      { status: 500 }
    );
  }
}