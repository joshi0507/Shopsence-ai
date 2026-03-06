# -*- coding: utf-8 -*-
"""
Forecast Service - Sales Prediction using Facebook Prophet

Handles time-series forecasting for sales data.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

# Use fixed seed for reproducible forecasts
np.random.seed(42)

try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False


class ForecastService:
    """
    Forecasting service using Facebook Prophet.
    
    Provides sales prediction and trend forecasting.
    """
    
    def __init__(self):
        """Initialize forecast service."""
        self.model = None
    
    def forecast(
        self,
        daily_df: pd.DataFrame,
        periods: int = 30,
        uncertainty: bool = True
    ) -> Dict[str, Any]:
        """
        Generate sales forecast.
        
        Args:
            daily_df: DataFrame with columns: date, units_sold, revenue.
            periods: Number of days to forecast.
            uncertainty: Include confidence intervals.
        
        Returns:
            dict: Forecast results with predictions and confidence intervals.
        """
        if not PROPHET_AVAILABLE:
            return {'error': 'Prophet library not available', 'fallback': self._simple_forecast(daily_df, periods)}
        
        if daily_df.empty or len(daily_df) < 7:
            return {'error': 'Insufficient data for forecasting (minimum 7 days required)'}
        
        try:
            # Prepare data for Prophet
            df = daily_df.copy()
            df['date'] = pd.to_datetime(df['date'])
            df = df[['date', 'revenue']].rename(columns={'date': 'ds', 'revenue': 'y'})
            
            # Initialize and fit model
            model = Prophet(
                daily_seasonality=False,
                weekly_seasonality=True,
                yearly_seasonality=False,
                interval_width=0.8 if uncertainty else 0
            )
            
            model.fit(df)
            
            # Create future dataframe
            future = model.make_future_dataframe(periods=periods)
            
            # Generate forecast
            forecast = model.predict(future)
            
            # Extract results
            forecast_result = forecast.tail(periods)[['ds', 'yhat', 'yhat_lower', 'yhat_upper', 'trend', 'weekly']]
            
            # Convert to JSON-serializable format
            predictions = []
            for _, row in forecast_result.iterrows():
                predictions.append({
                    'date': row['ds'].strftime('%Y-%m-%d'),
                    'predicted_revenue': round(float(row['yhat']), 2),
                    'lower_bound': round(float(row['yhat_lower']), 2) if uncertainty else None,
                    'upper_bound': round(float(row['yhat_upper']), 2) if uncertainty else None,
                    'trend': round(float(row['trend']), 2),
                    'weekly_effect': round(float(row['weekly']), 2)
                })
            
            # Calculate summary statistics
            total_predicted = sum(p['predicted_revenue'] for p in predictions)
            avg_daily = total_predicted / len(predictions)
            
            return {
                'success': True,
                'forecast_period_days': periods,
                'total_predicted_revenue': round(total_predicted, 2),
                'avg_daily_revenue': round(avg_daily, 2),
                'predictions': predictions,
                'model_info': {
                    'algorithm': 'Facebook Prophet',
                    'trained_on': df['ds'].min().strftime('%Y-%m-%d'),
                    'trained_to': df['ds'].max().strftime('%Y-%m-%d')
                }
            }
            
        except Exception as e:
            return {
                'error': f'Forecasting failed: {str(e)}',
                'fallback': self._simple_forecast(daily_df, periods)
            }
    
    def _simple_forecast(self, daily_df: pd.DataFrame, periods: int = 30) -> Dict[str, Any]:
        """
        Simple fallback forecast using moving average.
        
        Args:
            daily_df: DataFrame with columns: date, units_sold, revenue.
            periods: Number of days to forecast.
        
        Returns:
            dict: Simple forecast results.
        """
        if daily_df.empty:
            return {'error': 'No data for forecasting'}
        
        # Calculate moving average
        avg_revenue = daily_df['revenue'].tail(7).mean()
        
        # Generate predictions
        predictions = []
        today = datetime.utcnow()
        
        for i in range(periods):
            date = today + timedelta(days=i + 1)
            # Add some variance
            variance = np.random.normal(0, avg_revenue * 0.1)
            predicted = max(0, avg_revenue + variance)
            
            predictions.append({
                'date': date.strftime('%Y-%m-%d'),
                'predicted_revenue': round(predicted, 2),
                'lower_bound': round(predicted * 0.8, 2),
                'upper_bound': round(predicted * 1.2, 2),
                'trend': round(predicted, 2),
                'weekly_effect': 0
            })
        
        return {
            'success': True,
            'method': 'simple_moving_average',
            'forecast_period_days': periods,
            'total_predicted_revenue': round(sum(p['predicted_revenue'] for p in predictions), 2),
            'avg_daily_revenue': round(avg_revenue, 2),
            'predictions': predictions,
            'note': 'Simple forecast - install Prophet for better accuracy'
        }
    
    def detect_anomalies(
        self,
        daily_df: pd.DataFrame,
        threshold: float = 2.0
    ) -> List[Dict[str, Any]]:
        """
        Detect anomalies in sales data.
        
        Args:
            daily_df: DataFrame with columns: date, units_sold, revenue.
            threshold: Standard deviations for anomaly detection.
        
        Returns:
            list: List of detected anomalies.
        """
        if daily_df.empty or len(daily_df) < 7:
            return []
        
        df = daily_df.copy()
        df['date'] = pd.to_datetime(df['date'])
        
        # Calculate statistics
        mean_revenue = df['revenue'].mean()
        std_revenue = df['revenue'].std()
        
        # Find anomalies
        anomalies = []
        for _, row in df.iterrows():
            z_score = abs((row['revenue'] - mean_revenue) / std_revenue) if std_revenue > 0 else 0
            
            if z_score > threshold:
                anomalies.append({
                    'date': row['date'].strftime('%Y-%m-%d'),
                    'revenue': round(float(row['revenue']), 2),
                    'z_score': round(z_score, 2),
                    'type': 'spike' if row['revenue'] > mean_revenue else 'drop',
                    'deviation': f"{z_score:.1f} standard deviations from mean"
                })
        
        return anomalies
