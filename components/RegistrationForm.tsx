'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { 
  useInitData, 
  useThemeParams, 
  MainButton, 
  useUtils,
  useCloudStorage
} from '@telegram-apps/sdk-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define the form schema using Zod
const registrationSchema = z.object({
  fullName: z.string().min(1, { message: 'ФИО обязательно' }),
  email: z.string().email({ message: 'Некорректный email' }),
  phone: z.string().optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
    errorMap: () => ({ message: 'Выберите уровень в AI' })
  }),
  consentPd: z.literal(true, {
    errorMap: () => ({ message: 'Необходимо согласие на обработку персональных данных' })
  }),
  consentMarketing: z.boolean().optional()
});

type FormData = z.infer<typeof registrationSchema>;

const RegistrationForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initData = useInitData();
  const themeParams = useThemeParams();
  const utils = useUtils();
  const cloudStorage = useCloudStorage();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<FormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      experienceLevel: 'beginner',
      consentMarketing: false
    }
  });

  const formData = watch();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          initData: initData?.rawInitData || null
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Show success alert and close the app
        utils?.showAlert('Регистрация прошла успешно!', () => {
          window.Telegram?.WebApp.close();
        });
      } else {
        // Show error message
        utils?.showAlert(`Ошибка: ${result.error || 'Неизвестная ошибка'}`);
        setError(result.error || 'Произошла ошибка при регистрации');
      }
    } catch (err) {
      console.error('Registration error:', err);
      utils?.showAlert('Произошла ошибка при регистрации');
      setError('Произошла ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  // Get Telegram theme colors
  const bgColor = themeParams.bg_color || '#ffffff';
  const textColor = themeParams.text_color || '#000000';
  const hintColor = themeParams.hint_color || '#999999';
  const buttonColor = themeParams.button_color || '#3390ec';
  const buttonTextColor = themeParams.button_text_color || '#ffffff';

  return (
    <div 
      className="min-h-screen p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 
          className="text-2xl font-bold mb-6 text-center"
          style={{ color: textColor }}
        >
          Регистрация
        </h1>

        {error && (
          <div 
            className="mb-4 p-3 rounded-md text-center"
            style={{ backgroundColor: '#fee', color: '#c33' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name Field */}
          <div>
            <label 
              htmlFor="fullName" 
              className="block text-sm font-medium mb-1"
              style={{ color: textColor }}
            >
              ФИО
            </label>
            <input
              id="fullName"
              type="text"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              style={{ 
                backgroundColor: themeParams.bg_color || '#ffffff',
                color: textColor 
              }}
              placeholder="Иванов Иван Иванович"
              {...register('fullName')}
            />
            {errors.fullName && (
              <p 
                className="mt-1 text-sm"
                style={{ color: '#c33' }}
              >
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium mb-1"
              style={{ color: textColor }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              style={{ 
                backgroundColor: themeParams.bg_color || '#ffffff',
                color: textColor 
              }}
              placeholder="example@email.com"
              {...register('email')}
            />
            {errors.email && (
              <p 
                className="mt-1 text-sm"
                style={{ color: '#c33' }}
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label 
              htmlFor="phone" 
              className="block text-sm font-medium mb-1"
              style={{ color: textColor }}
            >
              Телефон (опционально)
            </label>
            <input
              id="phone"
              type="tel"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              style={{ 
                backgroundColor: themeParams.bg_color || '#ffffff',
                color: textColor 
              }}
              placeholder="+7 (XXX) XXX-XXXX"
              {...register('phone')}
            />
            {errors.phone && (
              <p 
                className="mt-1 text-sm"
                style={{ color: '#c33' }}
              >
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Experience Level Field */}
          <div>
            <label 
              htmlFor="experienceLevel" 
              className="block text-sm font-medium mb-1"
              style={{ color: textColor }}
            >
              Уровень в AI
            </label>
            <select
              id="experienceLevel"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.experienceLevel ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              style={{ 
                backgroundColor: themeParams.bg_color || '#ffffff',
                color: textColor 
              }}
              {...register('experienceLevel')}
            >
              <option value="beginner">Новичок</option>
              <option value="intermediate">Профи</option>
              <option value="advanced">Эксперт</option>
            </select>
            {errors.experienceLevel && (
              <p 
                className="mt-1 text-sm"
                style={{ color: '#c33' }}
              >
                {errors.experienceLevel.message}
              </p>
            )}
          </div>

          {/* Consent PD Checkbox */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="consentPd"
                type="checkbox"
                className="w-4 h-4 border rounded focus:ring-blue-500"
                style={{ 
                  backgroundColor: themeParams.bg_color || '#ffffff',
                  borderColor: hintColor
                }}
                {...register('consentPd')}
              />
            </div>
            <div className="ml-3 text-sm">
              <label 
                htmlFor="consentPd"
                style={{ color: textColor }}
              >
                Согласен на обработку персональных данных
              </label>
              {errors.consentPd && (
                <p 
                  className="mt-1"
                  style={{ color: '#c33' }}
                >
                  {errors.consentPd.message}
                </p>
              )}
            </div>
          </div>

          {/* Consent Marketing Checkbox */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="consentMarketing"
                type="checkbox"
                className="w-4 h-4 border rounded focus:ring-blue-500"
                style={{ 
                  backgroundColor: themeParams.bg_color || '#ffffff',
                  borderColor: hintColor
                }}
                {...register('consentMarketing')}
              />
            </div>
            <div className="ml-3 text-sm">
              <label 
                htmlFor="consentMarketing"
                style={{ color: textColor }}
              >
                Хочу получать анонсы
              </label>
            </div>
          </div>
        </form>

        {/* Telegram Main Button */}
        <div className="mt-6">
          <MainButton
            text="ЗАРЕГИСТРИРОВАТЬСЯ"
            visible={true}
            disabled={!isValid || isLoading}
            loading={isLoading}
            onClick={handleSubmit(onSubmit)}
            style={{
              backgroundColor: buttonColor,
              color: buttonTextColor
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;