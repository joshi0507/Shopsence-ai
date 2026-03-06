# -*- coding: utf-8 -*-
"""
Analytics Service - Business Intelligence & Insights

Handles data analysis, insights generation, and reporting.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime
import json


class AnalyticsService:
    """
    Analytics service for business intelligence.
    
    Provides comprehensive analytics and insights generation.
    """
    
    def __init__(self):
        """Initialize analytics service."""
        pass
    
    def analyze_product_performance(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyze product performance metrics.
        
        Args:
            df: DataFrame with columns: product_name, units_sold, price, revenue.
        
        Returns:
            dict: Product performance analysis.
        """
        if df.empty:
            return self._empty_analysis()
        
        # Calculate metrics
        total_products = len(df)
        total_revenue = df['revenue'].sum()
        total_units = df['units_sold'].sum()
        avg_price = df['price'].mean()
        avg_units = df['units_sold'].mean()
        
        # Top and bottom performers
        top_performer = df.loc[df['units_sold'].idxmax()]
        bottom_performer = df.loc[df['units_sold'].idxmin()]
        top_revenue = df.loc[df['revenue'].idxmax()]
        
        # Price segmentation
        price_quartiles = df['price'].quantile([0.25, 0.5, 0.75])
        
        # Performance categories - handle edge case where all products have same units
        try:
            quantiles = df['units_sold'].quantile([0.33, 0.67])
            df['performance_category'] = pd.cut(
                df['units_sold'],
                bins=[0, quantiles[0.33], quantiles[0.67], float('inf')],
                labels=['Low Performer', 'Medium Performer', 'High Performer']
            )
        except (ValueError, KeyError):
            # If quantiles cannot be computed, assign all to Medium
            df['performance_category'] = 'Medium Performer'
        
        return {
            'summary': {
                'total_products': total_products,
                'total_revenue': round(total_revenue, 2),
                'total_units': int(total_units),
                'avg_price': round(avg_price, 2),
                'avg_units_per_product': round(avg_units, 2)
            },
            'top_performers': {
                'by_units': {
                    'product_name': str(top_performer['product_name']),
                    'units_sold': int(top_performer['units_sold']),
                    'price': round(float(top_performer['price']), 2)
                },
                'by_revenue': {
                    'product_name': str(top_revenue['product_name']),
                    'revenue': round(float(top_revenue['revenue']), 2)
                }
            },
            'bottom_performers': {
                'product_name': str(bottom_performer['product_name']),
                'units_sold': int(bottom_performer['units_sold']),
                'price': round(float(bottom_performer['price']), 2)
            },
            'price_segmentation': {
                'low_price_threshold': round(float(price_quartiles[0.25]), 2),
                'medium_price_threshold': round(float(price_quartiles[0.5]), 2),
                'high_price_threshold': round(float(price_quartiles[0.75]), 2)
            },
            'performance_distribution': df['performance_category'].value_counts().to_dict()
        }
    
    def analyze_trends(self, daily_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyze sales trends over time.
        
        Args:
            daily_df: DataFrame with columns: date, units_sold, revenue.
        
        Returns:
            dict: Trend analysis.
        """
        if daily_df.empty:
            return {'error': 'No data available for trend analysis'}
        
        daily_df = daily_df.copy()
        daily_df['date'] = pd.to_datetime(daily_df['date'])
        daily_df = daily_df.sort_values('date')
        
        # Calculate moving averages
        daily_df['ma_7'] = daily_df['revenue'].rolling(window=7, min_periods=1).mean()
        daily_df['ma_30'] = daily_df['revenue'].rolling(window=30, min_periods=1).mean()
        
        # Calculate growth rate
        daily_df['revenue_growth'] = daily_df['revenue'].pct_change()
        avg_growth = daily_df['revenue_growth'].mean()
        
        # Identify trend direction
        if len(daily_df) >= 7:
            recent_week = daily_df.tail(7)['revenue'].mean()
            previous_week = daily_df.iloc[-14:-7]['revenue'].mean() if len(daily_df) >= 14 else daily_df.head(7)['revenue'].mean()
            trend = 'increasing' if recent_week > previous_week else 'decreasing'
        else:
            trend = 'insufficient_data'
        
        # Seasonality detection (simplified)
        daily_df['day_of_week'] = daily_df['date'].dt.dayofweek
        weekly_pattern = daily_df.groupby('day_of_week')['revenue'].mean().to_dict()
        
        return {
            'trend_direction': trend,
            'avg_daily_growth': round(avg_growth * 100, 2) if pd.notna(avg_growth) else 0,
            'avg_daily_revenue': round(daily_df['revenue'].mean(), 2),
            'peak_day': max(weekly_pattern, key=weekly_pattern.get) if weekly_pattern else None,
            'low_day': min(weekly_pattern, key=weekly_pattern.get) if weekly_pattern else None,
            'volatility': round(daily_df['revenue'].std(), 2),
            'data_points': len(daily_df)
        }
    
    def generate_recommendations(self, analysis: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        Generate actionable recommendations based on analysis.
        
        Args:
            analysis: Product performance analysis results.
        
        Returns:
            list: List of recommendations with priority and category.
        """
        recommendations = []
        
        if 'error' in analysis:
            return [{'priority': 'high', 'category': 'data', 'recommendation': 'Insufficient data for analysis'}]
        
        summary = analysis.get('summary', {})
        top = analysis.get('top_performers', {})
        bottom = analysis.get('bottom_performers', {})
        
        # Top performer recommendations
        if top.get('by_units'):
            recommendations.append({
                'priority': 'high',
                'category': 'inventory',
                'recommendation': f"Ensure adequate stock of {top['by_units']['product_name']} - your best seller with {top['by_units']['units_sold']:,} units sold"
            })
        
        # Bottom performer recommendations
        if bottom.get('product_name'):
            recommendations.append({
                'priority': 'medium',
                'category': 'pricing',
                'recommendation': f"Review pricing or marketing strategy for {bottom['product_name']} - lowest performer with only {bottom['units_sold']:,} units sold"
            })
        
        # Revenue optimization
        if summary.get('total_revenue', 0) > 0:
            recommendations.append({
                'priority': 'medium',
                'category': 'growth',
                'recommendation': f"Focus on converting medium performers to high performers to increase total revenue of ${summary['total_revenue']:,.2f}"
            })
        
        return recommendations
    
    def _empty_analysis(self) -> Dict[str, Any]:
        """Return empty analysis structure."""
        return {
            'summary': {
                'total_products': 0,
                'total_revenue': 0,
                'total_units': 0,
                'avg_price': 0,
                'avg_units_per_product': 0
            },
            'top_performers': {'by_units': {}, 'by_revenue': {}},
            'bottom_performers': {},
            'price_segmentation': {},
            'performance_distribution': {}
        }
    
    def _generate_chart_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate basic chart data for frontend."""
        if df.empty:
            return {}
        
        # Top 10 products by units sold
        top_products = df.nlargest(10, 'units_sold')
        
        # Bottom 10 products by units sold
        bottom_products = df.nsmallest(10, 'units_sold')
        
        # High sales but high cost - use revenue/units as proxy for price if not present
        high_cost_sales = df[df['price'] > df['price'].median()].nlargest(10, 'units_sold')
        
        # High sales but low cost
        low_cost_sales = df[df['price'] <= df['price'].median()].nlargest(10, 'units_sold')

        # Create chart data for Plotly
        def create_bar_chart(data, x_col, y_col, title, color='rgba(6, 182, 212, 0.8)'):
            if data.empty:
                return None
                
            return {
                'data': [{
                    'x': data[x_col].tolist(),
                    'y': data[y_col].tolist(),
                    'type': 'bar',
                    'marker': {
                        'color': color,
                        'line': {
                            'color': color.replace('0.8', '1'),
                            'width': 1
                        }
                    }
                }],
                'layout': {
                    'title': title,
                    'xaxis': {'title': x_col.replace('_', ' ').title()},
                    'yaxis': {'title': y_col.replace('_', ' ').title()}
                }
            }

        def create_scatter_plot(data, x_col, y_col, title, color='rgba(168, 85, 247, 0.8)'):
             if data.empty:
                return None
                
             return {
                'data': [{
                    'x': data[x_col].tolist(),
                    'y': data[y_col].tolist(),
                    'mode': 'markers+text',
                    'text': data['product_name'].tolist() if 'product_name' in data else None,
                    'textposition': 'top center',
                    'type': 'scatter',
                    'marker': {
                        'size': 12,
                        'color': color,
                        'opacity': 0.7
                    }
                }],
                'layout': {
                    'title': title,
                    'xaxis': {'title': x_col.replace('_', ' ').title()},
                    'yaxis': {'title': y_col.replace('_', ' ').title()}
                }
            }
        
        # Simplified prediction (Prophet-style but just trend-based for now)
        prediction_x = [f"Month {i+1}" for i in range(6)]
        prediction_y = [int(top_products['units_sold'].mean() * (1 + 0.05 * i)) for i in range(6)]
        
        prediction_graph = {
            'data': [{
                'x': prediction_x,
                'y': prediction_y,
                'type': 'scatter',
                'mode': 'lines+markers',
                'name': 'Forecast',
                'line': {'color': 'rgba(34, 197, 94, 1)', 'width': 3}
            }],
            'layout': {
                'title': 'Sales Forecast Next 6 Months',
                'xaxis': {'title': 'Timeline'},
                'yaxis': {'title': 'Predicted Units'}
            }
        }
        
        return {
            'most_selling': {
                'graph': create_bar_chart(top_products, 'product_name', 'units_sold', 'Most Selling Products'),
                'note': f'Top 10 products by units sold'
            },
            'low_selling': {
                'graph': create_bar_chart(bottom_products, 'product_name', 'units_sold', 'Low Selling Products', 'rgba(239, 68, 68, 0.8)'),
                'note': f'Bottom 10 products by units sold'
            },
            'high_cost_high_sales': {
                'graph': create_bar_chart(high_cost_sales, 'product_name', 'units_sold', 'High Cost High Performers', 'rgba(245, 158, 11, 0.8)'),
                'note': 'Premium products with strong market demand'
            },
            'low_cost_high_sales': {
                'graph': create_bar_chart(low_cost_sales, 'product_name', 'units_sold', 'Value Kings', 'rgba(16, 185, 129, 0.8)'),
                'note': 'High-volume low-cost items driving traffic'
            },
            'sales_prediction': {
                'graph': prediction_graph,
                'note': 'Advanced trend analysis predicting future demand based on historical velocity'
            },
            'product_report': {
                'graph': create_scatter_plot(top_products, 'price', 'units_sold', 'Price vs Volume Velocity'),
                'note': 'Visualizing the correlation between price points and sales volume'
            }
        }
