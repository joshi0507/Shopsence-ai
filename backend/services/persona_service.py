# -*- coding: utf-8 -*-
"""
Persona Service - Data-Driven Customer Persona Generation

This module generates customer personas from segmentation data.

Example usage:
    from services.persona_service import PersonaService
    
    service = PersonaService()
    personas = service.generate_personas(
        segmented_customers,
        segment_mapping,
        original_df
    )
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
import logging
import random

logger = logging.getLogger(__name__)


class PersonaService:
    """Generate customer personas from data"""
    
    # Persona name templates by segment type
    NAME_TEMPLATES = {
        'Champions': ['Premium Patricia', 'Loyal Larry', 'Elite Emma', 'Champion Chris'],
        'Loyal Customers': ['Regular Rachel', 'Faithful Fred', 'Steady Steve', 'Devoted Dana'],
        'Big Spenders': ['Luxury Linda', 'Premium Paul', 'Whale William', 'High-Roller Henry'],
        'At Risk': ['Fading Frank', 'Slipping Susan', 'Departing Dan', 'Vanishing Vera'],
        'Value Seekers': ['Budget Betty', 'Thrifty Tom', 'Saver Sam', 'Deal-Seeker Diana'],
        'New Customers': ['Newbie Nancy', 'Fresh Fred', 'Rookie Rick', 'Starter Stella'],
        'Promising': ['Growing Greg', 'Emerging Emily', 'Rising Ryan', 'Developing Donna'],
        'Lost Customers': ['Gone Gary', 'Lost Lucy', 'Absent Alex', 'Former Fiona']
    }
    
    # Persona colors for visualization
    PERSONA_COLORS = [
        '#00F0FF',  # Cyan
        '#7000FF',  # Purple
        '#FF00AA',  # Pink
        '#0066FF',  # Blue
        '#00FF88',  # Green
        '#FFD700',  # Gold
        '#FF6B00',  # Orange
        '#FF6D6D'   # Red
    ]
    
    def __init__(self, random_seed: int = 42):
        """
        Initialize persona service
        
        Args:
            random_seed: Random seed for reproducibility
        """
        random.seed(random_seed)
        np.random.seed(random_seed)
    
    def generate_personas(
        self,
        segmented_customers: pd.DataFrame,
        segment_mapping: Dict[int, str],
        original_df: Optional[pd.DataFrame] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate personas from segmented customer data
        
        Args:
            segmented_customers: DataFrame with segment assignments
            segment_mapping: Segment name mapping
            original_df: Original customer data with demographics (optional)
            
        Returns:
            List of persona dictionaries
        """
        logger.info(f"Generating personas for {len(segment_mapping)} segments")
        
        personas = []
        
        for segment_id, segment_name in segment_mapping.items():
            segment_customers = segmented_customers[
                segmented_customers['segment_id'] == segment_id
            ]
            
            # Get demographic data if available
            demo_data = None
            if original_df is not None and not original_df.empty:
                customer_ids = segment_customers['customer_id'].tolist()
                demo_data = original_df[
                    original_df['Customer ID'].isin(customer_ids)
                ]
            
            # Generate persona
            persona = self._create_persona(
                segment_id=segment_id,
                segment_name=segment_name,
                demo_data=demo_data,
                rfm_data=segment_customers
            )
            
            personas.append(persona)
        
        # Sort by total revenue
        personas.sort(key=lambda x: x['behavior']['total_revenue'], reverse=True)
        
        logger.info(f"Generated {len(personas)} personas")
        return personas
    
    def _create_persona(
        self,
        segment_id: int,
        segment_name: str,
        demo_data: Optional[pd.DataFrame],
        rfm_data: pd.DataFrame
    ) -> Dict[str, Any]:
        """Create a single persona"""
        
        # Generate name
        names = self.NAME_TEMPLATES.get(
            segment_name, 
            ['Customer Chris', 'Shopper Sharon', 'Buyer Bob']
        )
        name = np.random.choice(names)
        
        # Calculate demographics
        if demo_data is not None and not demo_data.empty:
            avg_age = demo_data['Age'].mean() if 'Age' in demo_data.columns else 35
            gender_split = demo_data['Gender'].value_counts().to_dict() if 'Gender' in demo_data.columns else {}
            top_locations = demo_data['Location'].value_counts().head(3).to_dict() if 'Location' in demo_data.columns else {}
        else:
            avg_age = 35
            gender_split = {}
            top_locations = {}
        
        # Calculate behavior metrics
        avg_frequency = rfm_data['frequency'].mean() if 'frequency' in rfm_data.columns else 1
        avg_monetary = rfm_data['monetary'].mean() if 'monetary' in rfm_data.columns else 100
        avg_order_value = avg_monetary / avg_frequency if avg_frequency > 0 else avg_monetary
        
        # Get preferences from RFM data or defaults
        total_customers = len(rfm_data)
        total_revenue = rfm_data['monetary'].sum() if 'monetary' in rfm_data.columns else 0
        
        # Generate description
        description = self._generate_description(
            segment_name, avg_age, avg_order_value, total_customers
        )
        
        return {
            'persona_id': segment_id,
            'name': name,
            'role': segment_name,
            'avatar_initials': ''.join([n[0] for n in name.split()[:2]]),
            'description': description,
            'color': self.PERSONA_COLORS[segment_id % len(self.PERSONA_COLORS)],
            'demographics': {
                'age_range': f"{int(max(18, avg_age - 5))}-{int(min(80, avg_age + 5))}",
                'gender_split': {str(k): int(v) for k, v in gender_split.items()},
                'top_locations': {str(k): int(v) for k, v in top_locations.items()}
            },
            'behavior': {
                'avg_order_value': round(float(avg_order_value), 2),
                'purchase_frequency': self._get_frequency_label(avg_frequency),
                'total_customers': total_customers,
                'total_revenue': round(float(total_revenue), 2),
                'avg_recency': round(float(rfm_data['recency'].mean()), 1) if 'recency' in rfm_data.columns else 30,
                'avg_rfm_score': round(float(rfm_data['rfm_score'].mean()), 0) if 'rfm_score' in rfm_data.columns else 300
            },
            'preferences': {
                'preferred_payment': self._get_preferred_payment(demo_data),
                'preferred_shipping': self._get_preferred_shipping(demo_data),
                'discount_sensitivity': round(self._calculate_discount_sensitivity(demo_data), 2)
            },
            'segment_id': segment_id
        }
    
    def _generate_description(
        self,
        segment_name: str,
        avg_age: float,
        avg_order_value: float,
        total_customers: int
    ) -> str:
        """Generate persona description"""
        
        descriptions = {
            'Champions': (
                f"Your best customers, typically aged {int(avg_age)}. "
                f"They spend an average of ${avg_order_value:.2f} per order "
                f"and purchase frequently. This segment of {total_customers} customers "
                "is highly engaged and loyal to your brand."
            ),
            'Loyal Customers': (
                f"Consistent buyers aged {int(avg_age)} who value your brand. "
                f"They spend ${avg_order_value:.2f} on average and return regularly. "
                f"With {total_customers} customers, they form the backbone of your business."
            ),
            'Big Spenders': (
                f"High-value customers with an average order of ${avg_order_value:.2f}. "
                f"They may not purchase frequently but spend significantly when they do. "
                f"These {total_customers} customers are key to revenue growth."
            ),
            'At Risk': (
                f"Previously active customers (avg age {int(avg_age)}) who haven't "
                f"purchased recently. They used to spend ${avg_order_value:.2f} on average. "
                f"These {total_customers} customers need immediate re-engagement."
            ),
            'Value Seekers': (
                f"Budget-conscious shoppers aged {int(avg_age)} looking for deals. "
                f"Average spend is ${avg_order_value:.2f}. "
                f"This segment of {total_customers} customers responds well to promotions."
            ),
            'New Customers': (
                f"Recent acquisitions, typically aged {int(avg_age)}. "
                f"First purchase averaged ${avg_order_value:.2f}. "
                f"These {total_customers} customers need onboarding and conversion to repeat buyers."
            ),
            'Promising': (
                f"Emerging customers showing potential, aged {int(avg_age)}. "
                f"Average spend of ${avg_order_value:.2f} with growing engagement. "
                f"These {total_customers} customers could become loyal with proper nurturing."
            ),
            'Lost Customers': (
                f"Former customers aged {int(avg_age)} who have been inactive for extended periods. "
                f"Previously spent ${avg_order_value:.2f} on average. "
                f"These {total_customers} customers require win-back campaigns."
            )
        }
        
        return descriptions.get(
            segment_name,
            f"Customer segment with average age {int(avg_age)} and "
            f"order value ${avg_order_value:.2f}. "
            f"Contains {total_customers} customers."
        )
    
    def _get_frequency_label(self, avg_frequency: float) -> str:
        """Convert numeric frequency to label"""
        if avg_frequency >= 10:
            return 'Very Frequent'
        elif avg_frequency >= 5:
            return 'Frequent'
        elif avg_frequency >= 2:
            return 'Regular'
        elif avg_frequency >= 1:
            return 'Occasional'
        else:
            return 'Rare'
    
    def _get_preferred_payment(self, demo_data: Optional[pd.DataFrame]) -> str:
        """Get preferred payment method from data"""
        if demo_data is not None and 'Preferred Payment Method' in demo_data.columns:
            return str(demo_data['Preferred Payment Method'].mode().iloc[0])
        return 'Credit Card'
    
    def _get_preferred_shipping(self, demo_data: Optional[pd.DataFrame]) -> str:
        """Get preferred shipping method from data"""
        if demo_data is not None and 'Shipping Type' in demo_data.columns:
            return str(demo_data['Shipping Type'].mode().iloc[0])
        return 'Standard'
    
    def _calculate_discount_sensitivity(self, demo_data: Optional[pd.DataFrame]) -> float:
        """Calculate discount sensitivity score"""
        if demo_data is not None and 'Discount Applied' in demo_data.columns:
            discount_users = len(demo_data[demo_data['Discount Applied'] != 'None'])
            return discount_users / len(demo_data) if len(demo_data) > 0 else 0.5
        return 0.5
    
    def get_persona_detail(
        self,
        persona: Dict[str, Any],
        sample_customers: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Get detailed persona information
        
        Args:
            persona: Persona dictionary
            sample_customers: Optional list of sample customers
            
        Returns:
            Detailed persona dictionary
        """
        detail = persona.copy()
        
        # Add marketing recommendations
        detail['marketing_recommendations'] = self._get_marketing_recommendations(
            persona['role']
        )
        
        # Add sample customers if provided
        if sample_customers:
            detail['sample_customers'] = sample_customers[:5]
        
        return detail
    
    def _get_marketing_recommendations(self, segment_name: str) -> List[str]:
        """Get marketing recommendations for segment"""
        
        recommendations = {
            'Champions': [
                'Target with premium product launches',
                'Offer exclusive early access',
                'Invite to VIP loyalty program',
                'Request reviews and testimonials'
            ],
            'Loyal Customers': [
                'Reward with loyalty points',
                'Offer subscription discounts',
                'Create bundle deals',
                'Send personalized recommendations'
            ],
            'Big Spenders': [
                'Showcase premium products',
                'Offer concierge service',
                'Provide exclusive deals',
                'Focus on quality over price'
            ],
            'At Risk': [
                'Send win-back offers',
                'Create urgency with limited-time deals',
                'Survey to understand concerns',
                'Offer personalized incentives'
            ],
            'Value Seekers': [
                'Highlight discounts and sales',
                'Offer coupon codes',
                'Promote clearance items',
                'Emphasize value for money'
            ],
            'New Customers': [
                'Send welcome series',
                'Offer first-purchase discount',
                'Provide onboarding content',
                'Encourage second purchase'
            ],
            'Promising': [
                'Nurture with targeted content',
                'Offer progressive discounts',
                'Introduce loyalty program',
                'Cross-sell related products'
            ],
            'Lost Customers': [
                'Launch reactivation campaign',
                'Offer significant discounts',
                'Survey to understand churn',
                'Create FOMO with new arrivals'
            ]
        }
        
        return recommendations.get(
            segment_name,
            ['Analyze segment behavior', 'Create targeted campaigns']
        )


# Convenience function
def create_personas(
    segmented_customers: pd.DataFrame,
    segment_mapping: Dict[int, str],
    original_df: Optional[pd.DataFrame] = None
) -> List[Dict[str, Any]]:
    """
    Quick persona generation function
    
    Args:
        segmented_customers: DataFrame with segment assignments
        segment_mapping: Segment name mapping
        original_df: Original customer data (optional)
        
    Returns:
        List of persona dictionaries
    """
    service = PersonaService()
    return service.generate_personas(
        segmented_customers, segment_mapping, original_df
    )
