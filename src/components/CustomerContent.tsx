// src/components/CustomerContent.tsx

'use client';

import React from 'react';
import { User, Order } from '@/types/types';
import OrderItem from '@/components/OrderItem';
import { useTranslations } from '@/context/TranslationsContext';

interface CustomerContentProps {
  user: User;
}

const CustomerContent: React.FC<CustomerContentProps> = ({ user }) => {
  const { t } = useTranslations();
  const { email, orders } = user;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">
        {t('customerPage.welcome', {
          name: email || t('customerPage.valuedCustomer'),
        })}
      </h1>

      {orders && orders.length > 0 ? (
        <ul className="space-y-4">
          {orders.map((order: Order) => (
            <OrderItem
              key={order.id}
              order={order}
              userToken={user.token || ''}
            />
          ))}
        </ul>
      ) : (
        <p>{t('customerPage.noOrders')}</p>
      )}
    </div>
  );
};

export default CustomerContent;
