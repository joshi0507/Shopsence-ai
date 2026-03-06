# -*- coding: utf-8 -*-
"""
Product Affinity Service - Market Basket Analysis

This module implements product affinity analysis using:
1. Apriori algorithm for frequent itemset mining
2. Association rules for product relationships
3. Affinity network generation for visualization

Example usage:
    from services.affinity_service import AffinityService
    
    service = AffinityService()
    basket = service.create_basket_matrix(transactions)
    itemsets = service.find_frequent_itemsets(basket, min_support=0.05)
    rules = service.generate_association_rules(itemsets, min_confidence=0.3)
    network = service.build_affinity_network(rules, transactions)
"""

import pandas as pd
import numpy as np
from mlxtend.frequent_patterns import apriori, association_rules, fpgrowth
from typing import Dict, Any, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class AffinityService:
    """Product affinity and market basket analysis"""
    
    def __init__(self):
        """Initialize affinity service"""
        pass
    
    def create_basket_matrix(
        self,
        transactions_df: pd.DataFrame,
        level: str = 'product'
    ) -> pd.DataFrame:
        """
        Create binary basket matrix for Apriori/FP-Growth
        
        Args:
            transactions_df: Transactions DataFrame with columns:
                - customer_id
                - product_name (or category if level='category')
            level: 'product' or 'category'
            
        Returns:
            Binary basket matrix (customers x items)
            Example:
                         Wireless Headphones  Phone Case  Laptop
                C001                      1           1       0
                C002                      0           1       1
                C003                      1           0       0
        """
        logger.info(f"Creating basket matrix at {level} level")
        
        if level == 'product':
            group_col = 'product_name'
        else:  # category
            group_col = 'category'
        
        # Group by customer and item, count purchases
        basket = transactions_df.groupby(
            ['customer_id', group_col]
        ).size().unstack(fill_value=0)
        
        # Convert to binary (1 if purchased, 0 otherwise)
        basket_binary = basket.applymap(lambda x: 1 if x > 0 else 0)
        
        logger.info(
            f"Created basket matrix: {basket_binary.shape[0]} customers x "
            f"{basket_binary.shape[1]} items"
        )
        
        return basket_binary
    
    def find_frequent_itemsets(
        self,
        basket_df: pd.DataFrame,
        min_support: float = 0.05,
        method: str = 'apriori',
        max_len: int = 2
    ) -> pd.DataFrame:
        """
        Find frequent itemsets using Apriori or FP-Growth
        
        Args:
            basket_df: Binary basket matrix
            min_support: Minimum support threshold (default: 0.05 = 5%)
            method: 'apriori' or 'fpgrowth'
            max_len: Maximum itemset size (default: 2 for pairs)
            
        Returns:
            DataFrame of frequent itemsets with columns:
                - support: Support value
                - itemsets: Frozenset of items
                
        Example:
            support     itemsets
            0.12        (Wireless Headphones)
            0.08        (Phone Case)
            0.05        (Wireless Headphones, Phone Case)
        """
        logger.info(
            f"Finding frequent itemsets (min_support={min_support}, method={method})"
        )
        
        try:
            if method == 'fpgrowth':
                frequent_itemsets = fpgrowth(
                    basket_df,
                    min_support=min_support,
                    use_colnames=True,
                    max_len=max_len
                )
            else:  # apriori
                frequent_itemsets = apriori(
                    basket_df,
                    min_support=min_support,
                    use_colnames=True,
                    max_len=max_len
                )
            
            logger.info(f"Found {len(frequent_itemsets)} frequent itemsets")
            return frequent_itemsets
            
        except Exception as e:
            logger.error(f"Error finding frequent itemsets: {e}")
            # Return empty DataFrame with expected columns
            return pd.DataFrame(columns=['support', 'itemsets'])
    
    def generate_association_rules(
        self,
        frequent_itemsets: pd.DataFrame,
        min_confidence: float = 0.3,
        min_lift: float = 1.5,
        metric: str = 'confidence'
    ) -> pd.DataFrame:
        """
        Generate association rules from frequent itemsets
        
        Args:
            frequent_itemsets: Frequent itemsets from find_frequent_itemsets
            min_confidence: Minimum confidence threshold (default: 0.3)
            min_lift: Minimum lift threshold (default: 1.5)
            metric: Metric for filtering ('confidence', 'lift', 'support')
            
        Returns:
            DataFrame of association rules with columns:
                - antecedents: Items that trigger the rule
                - consequents: Items that are bought as a result
                - support: Support value
                - confidence: Confidence value
                - lift: Lift value
                - leverage: Leverage value
                - conviction: Conviction value
                
        Example:
            antecedents         consequents      support  confidence  lift
            (Laptop)            (Laptop Bag)     0.08     0.62        4.1
            (Wireless Headphones) (Phone Case)   0.05     0.45        3.2
        """
        if frequent_itemsets.empty:
            logger.warning("No frequent itemsets to generate rules from")
            return pd.DataFrame()
        
        logger.info(
            f"Generating association rules (min_confidence={min_confidence})"
        )
        
        try:
            rules = association_rules(
                frequent_itemsets,
                metric=metric,
                min_threshold=min_confidence
            )
            
            # Filter by lift
            if 'lift' in rules.columns and min_lift > 0:
                rules = rules[rules['lift'] >= min_lift]
            
            # Sort by lift (descending)
            if 'lift' in rules.columns:
                rules = rules.sort_values('lift', ascending=False)
            
            logger.info(f"Generated {len(rules)} association rules")
            return rules
            
        except Exception as e:
            logger.error(f"Error generating association rules: {e}")
            return pd.DataFrame()
    
    def build_affinity_network(
        self,
        rules_df: pd.DataFrame,
        transactions_df: pd.DataFrame,
        top_n: int = 50
    ) -> Dict[str, Any]:
        """
        Build affinity network for visualization
        
        Args:
            rules_df: Association rules DataFrame
            transactions_df: Transactions for product stats
            top_n: Number of top rules to include
            
        Returns:
            Network data with nodes and links:
            {
                'nodes': [{id, label, category, value, color}, ...],
                'links': [{source, target, strength, support, confidence, lift}, ...]
            }
        """
        if rules_df.empty:
            logger.warning("No rules to build network from")
            return {'nodes': [], 'links': []}
        
        logger.info(f"Building affinity network with top {top_n} rules")
        
        # Get top rules
        top_rules = rules_df.head(top_n)
        
        # Build set of products in rules
        products = set()
        for _, rule in top_rules.iterrows():
            products.add(self._frozerset_to_string(rule['antecedents']))
            products.add(self._frozerset_to_string(rule['consequents']))
        
        # Calculate product stats
        product_stats = transactions_df.groupby('product_name').agg({
            'revenue': 'sum',
            'customer_id': 'count'
        }).reset_index()
        product_stats.columns = ['product', 'revenue', 'transactions']
        
        # Get revenue range for color scaling
        max_revenue = product_stats['revenue'].max() if len(product_stats) > 0 else 1
        
        # Create nodes
        nodes = []
        for product in products:
            stats = product_stats[product_stats['product'] == product]
            
            revenue = float(stats['revenue'].iloc[0]) if len(stats) > 0 else 0
            transactions = int(stats['transactions'].iloc[0]) if len(stats) > 0 else 1
            
            nodes.append({
                'id': product,
                'label': product,
                'category': 'product',
                'value': transactions,
                'color': self._get_color_for_value(revenue, max_revenue)
            })
        
        # Create links
        links = []
        for _, rule in top_rules.iterrows():
            antecedent = self._frozerset_to_string(rule['antecedents'])
            consequent = self._frozerset_to_string(rule['consequents'])
            
            links.append({
                'source': antecedent,
                'target': consequent,
                'strength': min(float(rule['lift']) / 5, 1.0),  # Normalize to 0-1
                'support': float(rule['support']),
                'confidence': float(rule['confidence']),
                'lift': float(rule['lift'])
            })
        
        return {
            'nodes': nodes,
            'links': links
        }
    
    def suggest_bundles(
        self,
        rules_df: pd.DataFrame,
        min_lift: float = 2.0,
        max_bundles: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Suggest product bundles based on affinity
        
        Args:
            rules_df: Association rules DataFrame
            min_lift: Minimum lift for bundle consideration
            max_bundles: Maximum number of bundles to return
            
        Returns:
            List of bundle suggestions:
            [
                {
                    'bundle_name': 'Product A + Product B',
                    'products': ['Product A', 'Product B'],
                    'affinity_score': 3.2,
                    'confidence': 0.45,
                    'estimated_lift': '220%'
                },
                ...
            ]
        """
        if rules_df.empty:
            logger.warning("No rules to generate bundles from")
            return []
        
        logger.info(f"Suggesting bundles (min_lift={min_lift})")
        
        bundles = []
        
        # Filter high-lift rules
        high_lift_rules = rules_df[rules_df['lift'] >= min_lift]
        
        for _, rule in high_lift_rules.iterrows():
            antecedent = self._frozerset_to_string(rule['antecedents'])
            consequent = self._frozerset_to_string(rule['consequents'])
            
            bundles.append({
                'bundle_name': f"{antecedent} + {consequent}",
                'products': [antecedent, consequent],
                'affinity_score': float(rule['lift']),
                'confidence': float(rule['confidence']),
                'support': float(rule['support']),
                'estimated_lift': f"{(float(rule['lift']) - 1) * 100:.0f}%"
            })
        
        # Sort by affinity score and return top bundles
        bundles.sort(key=lambda x: x['affinity_score'], reverse=True)
        return bundles[:max_bundles]
    
    def get_category_affinity(
        self,
        transactions_df: pd.DataFrame,
        min_support: float = 0.1
    ) -> pd.DataFrame:
        """
        Calculate category-level affinity
        
        Args:
            transactions_df: Transactions DataFrame
            min_support: Minimum support threshold
            
        Returns:
            DataFrame of category affinity rules
        """
        logger.info("Calculating category affinity")
        
        # Create category basket
        category_basket = self.create_basket_matrix(
            transactions_df, 
            level='category'
        )
        
        # Find frequent itemsets
        itemsets = self.find_frequent_itemsets(
            category_basket, 
            min_support=min_support
        )
        
        # Generate rules
        rules = self.generate_association_rules(
            itemsets,
            min_confidence=0.3,
            min_lift=1.5
        )
        
        return rules
    
    def _frozerset_to_string(self, itemset) -> str:
        """Convert frozenset to clean string"""
        if isinstance(itemset, frozenset):
            return ', '.join(sorted([str(x) for x in itemset]))
        return str(itemset)
    
    def _get_color_for_value(
        self,
        value: float,
        max_value: float
    ) -> str:
        """Get color based on value percentile"""
        if max_value == 0:
            return '#7000FF'  # Default purple
        
        percentile = value / max_value
        
        if percentile > 0.75:
            return '#00F0FF'  # Cyan - high value
        elif percentile > 0.5:
            return '#7000FF'  # Purple - medium
        elif percentile > 0.25:
            return '#FF00AA'  # Pink - low-medium
        else:
            return '#0066FF'  # Blue - low


# Convenience function
def analyze_product_affinity(
    transactions_df: pd.DataFrame,
    min_support: float = 0.05,
    min_confidence: float = 0.3,
    min_lift: float = 1.5
) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
    """
    Quick affinity analysis function
    
    Args:
        transactions_df: Transactions DataFrame
        min_support: Minimum support threshold
        min_confidence: Minimum confidence threshold
        min_lift: Minimum lift threshold
        
    Returns:
        Tuple of (itemsets, rules, network_data)
    """
    service = AffinityService()
    basket = service.create_basket_matrix(transactions_df)
    itemsets = service.find_frequent_itemsets(basket, min_support)
    rules = service.generate_association_rules(
        itemsets, 
        min_confidence, 
        min_lift
    )
    network = service.build_affinity_network(rules, transactions_df)
    return itemsets, rules, network
