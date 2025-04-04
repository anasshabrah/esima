// src/app/referral-dashboard/ReferralDashboard.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ClipLoader } from 'react-spinners';
import { useTranslations } from '@/context/TranslationsContext';
import { ReferralData, UserWithOrders } from '@/types/types';
import PaymentSettings from './PaymentSettings';
import PayoutRequest from './PayoutRequest';
import WithdrawalHistory from './WithdrawalHistory';

const ReferralDashboard: React.FC = () => {
  const { t } = useTranslations();
  const { user, token, loading: authLoading } = useAuth();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(0);

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.push('/');
        return;
      }

      async function fetchReferralData() {
        try {
          const response = await fetch(`/api/referral-dashboard`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            const errorData = await response.json();
            setError(errorData.error || t('Failed to fetch referral data.'));
            setLoading(false);
            return;
          }
          const result: ReferralData = await response.json();
          setData(result);

          // Fetch totalWithdrawn
          const withdrawalsResponse = await fetch(
            `/api/referral-dashboard/withdrawal-history`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (withdrawalsResponse.ok) {
            const withdrawals = await withdrawalsResponse.json();
            const totalWithdrawnAmount = withdrawals.reduce(
              (sum: number, w: any) => sum + (w.amount || 0),
              0
            );
            setTotalWithdrawn(totalWithdrawnAmount);
          }

          setLoading(false);
        } catch (err: any) {
          console.error('Error fetching referral data:', err);
          setError(t('An unexpected error occurred.'));
          setLoading(false);
        }
      }

      fetchReferralData();
    }
  }, [token, router, t, authLoading]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedMessage(t('Message copied!'));
        setTimeout(() => setCopiedMessage(null), 3000); // Clear message after 3 seconds
      },
      () => {
        setCopiedMessage(t('Failed to copy message.'));
        setTimeout(() => setCopiedMessage(null), 3000);
      }
    );
  };

  // Function to mask email addresses
  const maskEmail = (email: string | null | undefined): string => {
    if (!email) return '***@***.***';
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***@***.***';
    const maskedLocal = local.length > 3 ? `${local.slice(0, 3)}***` : '***';
    return `${maskedLocal}@***.***`;
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full bg-gray-100">
        <ClipLoader size={50} color="#1f3b4d" />
      </div>
    );
  }

  if (!token) {
    return null;
  }

  // Define suggested messages with placeholders for the coupon code
  const suggestedMessages = [
    {
      platform: 'Facebook',
      message: `I've been using alodata for my travels and it's been great! If you're interested, use my code ${data?.couponCode ?? ''} to get a 10% discount on your purchase. Check it out here: https://alodata.com`,
    },
    {
      platform: 'Telegram',
      message: `Just wanted to share that alodata has been really helpful for staying connected while I'm traveling. You can use my code ${data?.couponCode ?? ''} to get a 10% discount on your orders if you decide to try it out! More info: https://alodata.com`,
    },
    {
      platform: 'WhatsApp',
      message: `Hey! I've been using alodata for my data needs abroad, and it's been really reliable. If you're interested, you can get a 10% discount on your purchase with my code ${data?.couponCode ?? ''}. Take a look: https://alodata.com`,
    },
  ];

  const totalProfit = data?.totalProfit ?? 0;
  const totalWithdrawnAmount = totalWithdrawn ?? 0;
  let availableBalance = totalProfit - totalWithdrawnAmount;
  if (isNaN(availableBalance)) {
    availableBalance = 0;
  }

  const totalSalesNumber = data?.totalSales ?? 0;
  const totalSalesDisplay = isNaN(totalSalesNumber) ? '0.00' : totalSalesNumber.toFixed(2);
  const availableBalanceDisplay = availableBalance.toFixed(2);
  const totalProfitDisplay = isNaN(totalProfit) ? '0.00' : totalProfit.toFixed(2);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-grow w-full max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          {error ? (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          ) : data ? (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-primary">
                  {t('Referral Dashboard')}
                </h1>
                <p className="text-gray-600">
                  {t('Manage your referrals, track sales, and view your earnings below.')}
                </p>
              </div>

              {/* Coupon Code Section */}
              <div className="bg-gray-50 shadow rounded p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4 text-primary flex items-center">
                  {t('Your Coupon Code')}
                </h2>
                <div className="flex flex-col sm:flex-row items-center w-full">
                  <input
                    type="text"
                    value={data.couponCode || ''}
                    readOnly
                    className="w-full sm:w-2/3 border border-gray-300 rounded-l px-4 py-2 uppercase focus:outline-none focus:ring-primary focus:border-primary"
                    aria-label={t('Your unique coupon code')}
                  />
                  <button
                    onClick={() => copyToClipboard(data.couponCode || '')}
                    className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-r hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mt-2 sm:mt-0"
                    aria-label={t('Copy coupon code')}
                  >
                    {t('Copy')}
                  </button>
                </div>
                <p className="mt-4 text-gray-600">
                  {t('Share this code with your friends and family to provide them with discounts on their orders, while you earn money.')}
                </p>
              </div>

              {/* Referred Users Table */}
              <div className="bg-gray-50 shadow rounded p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  {t('Referred Users')}
                </h2>
                {data.referredUsers.length === 0 ? (
                  <p className="text-gray-600">{t('No referred users yet.')}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                            {t('Email')}
                          </th>
                          <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                            {t('Country')}
                          </th>
                          <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                            {t('Orders')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.referredUsers.map((user: UserWithOrders, idx) => (
                          <tr key={user.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                            <td className="py-3 px-4 text-sm text-gray-700">{maskEmail(user.email)}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{user.country || 'N/A'}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{user.orders.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Earnings Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white shadow rounded p-6 flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 text-blue-500 rounded-full p-3">💵</div>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600 text-sm">{t('Total Sales')}</p>
                    <p className="text-xl font-bold">${totalSalesDisplay}</p>
                  </div>
                </div>

                <div className="bg-white shadow rounded p-6 flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-green-100 text-green-500 rounded-full p-3">💰</div>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600 text-sm">{t('Total Profit')}</p>
                    <p className="text-xl font-bold">${totalProfitDisplay}</p>
                  </div>
                </div>

                <div className="bg-white shadow rounded p-6 flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-yellow-100 text-yellow-500 rounded-full p-3">👜</div>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-600 text-sm">{t('Available Balance')}</p>
                    <p className="text-xl font-bold">${availableBalanceDisplay}</p>
                  </div>
                </div>
              </div>

              {/* Payout Request Section */}
              <PayoutRequest
                token={token}
                totalProfit={totalProfit}
                totalWithdrawn={totalWithdrawnAmount}
              />

              {/* Withdrawal History Section */}
              <WithdrawalHistory token={token} />

              {/* Payment Settings Section */}
              <PaymentSettings token={token} />

              {/* Affiliate Program Instructions Section - English */}
              <div className="bg-gray-50 shadow rounded p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  {t('Affiliate Program Instructions')}
                </h2>
                {/* Earning Instructions */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-secondary mb-2">
                    {t('Earn 10% with Your Coupon')}
                  </h3>
                  <p className="text-gray-600">
                    {t(
                      'Use your unique coupon code to earn a 10% commission on every sale made through your referrals. Share your code with friends and family to start earning!'
                    )}
                  </p>
                </div>

                {/* Promotion Strategies */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-secondary mb-2">
                    {t('Promotion Strategies')}
                  </h3>
                  <ul className="list-disc list-inside text-gray-600">
                    <li>{t('Share your personal experiences with alodata on social media.')}</li>
                    <li>{t('Write about how alodata has helped you stay connected during your travels.')}</li>
                    <li>{t('Explain the benefits of the 10% discount to your audience.')}</li>
                    <li>{t('Send personalized messages to your contacts introducing alodata.')}</li>
                  </ul>
                </div>

                {/* Suggested Messages */}
                <div>
                  <h3 className="text-xl font-semibold text-secondary mb-2">
                    {t('Suggested Messages')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t(
                      'Use the messages below to share your experience with alodata. Click the copy button to easily share your unique coupon code on your preferred platform.'
                    )}
                  </p>
                  {copiedMessage && (
                    <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
                      {copiedMessage}
                    </div>
                  )}
                  <div className="space-y-4">
                    {suggestedMessages.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center">
                        <div className="flex-1 w-full">
                          <p className="font-semibold text-gray-700">{item.platform}:</p>
                          <textarea
                            readOnly
                            value={item.message}
                            className="w-full bg-gray-100 border border-gray-300 rounded p-2 mt-1 resize-none"
                            rows={3}
                          />
                        </div>
                        <button
                          onClick={() => copyToClipboard(item.message)}
                          className="mt-2 sm:mt-0 sm:ml-4 bg-primary text-white px-4 py-2 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary w-full sm:w-auto"
                          aria-label={t(`Copy message for ${item.platform}`)}
                        >
                          {t('Copy')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Affiliate Program Instructions Section - Arabic */}
              <div className="bg-gray-50 shadow rounded p-6 mb-6 rtl" dir="rtl">
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  تعليمات برنامج الشراكة
                </h2>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-secondary mb-2">
                    اربح 10% مع كودك الخاص
                  </h3>
                  <p className="text-gray-600">
                    استخدم كود القسيمة الفريد الخاص فيك لتحصل على عمولة 10% على كل عملية بيع تتم عن طريق إحالاتك. شارك كودك مع الأصدقاء والعائلة وابدأ في الربح!
                  </p>
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-secondary mb-2">
                    استراتيجيات الترويج
                  </h3>
                  <ul className="list-disc list-inside text-gray-600">
                    <li>شارك تجاربك مع ألوداتا على وسائل التواصل الاجتماعي.</li>
                    <li>احكي كيف ألوداتا ساعدتك تظل متواصل أثناء سفرك.</li>
                    <li>اشرح فوائد الخصم بنسبة 10% لجمهورك.</li>
                    <li>أرسل رسائل شخصية لجهات اتصالك تعرفهم على ألوداتا.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-secondary mb-2">
                    الرسائل المقترحة
                  </h3>
                  <p className="text-gray-600 mb-4">
                    استخدم الرسائل أدناه لمشاركة تجربتك مع ألوداتا. اضغط على زر النسخ لمشاركة كود القسيمة الخاص فيك بسهولة.
                  </p>
                  {copiedMessage && (
                    <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
                      {copiedMessage}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center">
                      <div className="flex-1 w-full">
                        <p className="font-semibold text-gray-700">فيسبوك:</p>
                        <textarea
                          readOnly
                          value={`استخدمت انترنت ألوداتا في رحلاتي وكانت ممتازة! إذا حابب، استخدم كودي ${data?.couponCode ?? ''} بيخصم 10% على باقة انترنت الشريحة الالكترونية للآيفون والأندرويد. هذا الموقع: https://alodata.com`}
                          className="w-full bg-gray-100 border border-gray-300 rounded p-2 mt-1 resize-none"
                          rows={3}
                        />
                      </div>
                      <button
                        onClick={() => copyToClipboard(`استخدمت انترنت ألوداتا في رحلاتي وكانت ممتازة! إذا حابب، استخدم كودي ${data?.couponCode ?? ''} بيخصم 10% على باقة انترنت الشريحة الالكترونية للآيفون والأندرويد. هذا الموقع: https://alodata.com`)}
                        className="mt-2 sm:mt-0 sm:ml-4 bg-primary text-white px-4 py-2 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary w-full sm:w-auto"
                        aria-label="نسخ الرسالة لفيسبوك"
                      >
                        نسخ
                      </button>
                    </div>
                    {/* Telegram and WhatsApp messages similar to above */}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;
