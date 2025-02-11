'use client';

// react
import { useState, type ReactElement } from 'react';
// hookform
import {
  patchUserReceptionSetting,
  userReceptionSettingFormSchema,
  type userReceptionSettingFormInputType,
  type UserReceptionSettingResponseData,
} from '@/features/api/user_properties';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormItem,
  FormMessage,
} from '@/app/components/ui/shadcn/form';
// shadcn
import { Button } from '@/app/components/ui/shadcn/button';
import { Switch } from '@/app/components/ui/shadcn/switch';
import { Alert, AlertDescription } from '@/app/components/ui/shadcn/alert';
// icons
import { Loader2 } from 'lucide-react';
// components
import { showToast, OverlaySpinner } from '@/app/components/utils';


// ReceptionSettingForm
export function ReceptionSettingForm({ userReceptionSettingData }: {userReceptionSettingData: UserReceptionSettingResponseData}): ReactElement {

  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');

  // ++++++++++
  // form
  // - useForm
  const form = useForm<userReceptionSettingFormInputType>({
    resolver: zodResolver(userReceptionSettingFormSchema),
    defaultValues: {
      is_receive_all:            userReceptionSettingData.isReceiveAll,
      is_receive_important_only: userReceptionSettingData.isReceiveImportantOnly,
    },
  });
  // - フォームの内容に応じた変更 (ボタンのどちらかをチェック状態にする)
  const { setValue } = form;
  // - onSubmit
  const onSubmit: SubmitHandler<userReceptionSettingFormInputType> = async (data) => {

    // 多重送信防止
    if (isSending) return;

    setIsSending(true);
    setErrorMsg('');
    try {
      const result = await patchUserReceptionSetting(data);
      showToast(result?.toastType, result?.toastMessage, { duration: 5000 });
      if (result.ok) {
        //
      } else {
        setErrorMsg(result?.message ?? '');
      };
    } catch {
      showToast('error', '更新に失敗しました');
      setErrorMsg('更新に失敗しました');
    } finally {
      // 多重送信防止
      setIsSending(false);
    };
  };
  // ++++++++++

  return (
    <>
      {/* OverlaySpinner */}
      <OverlaySpinner isActivate={isSending} />

      {/* Alert */}
      {errorMsg && (
        <Alert variant='destructive' className='mb-4'>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}
              className=''>

          {/* is_receive_all (Switch) */}
          <FormField control = {form.control}
                     name    = 'is_receive_all'
                     render  = {({ field }) => (
              <FormItem>
                <FormLabel htmlFor='is_receive_all'>すべてのメールを受信する</FormLabel>
                <FormControl>
                  <Switch id              = 'is_receive_all'
                          checked         = {field.value}
                          onCheckedChange = {(checked) => {
                            // こちらがONになったら、もう片方をOFFにする
                            if (checked) setValue('is_receive_important_only', false);
                            field.onChange(checked);
                          }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

          {/* is_receive_important_only (Switch) */}
          <FormField control = {form.control}
                     name    = 'is_receive_important_only'
                     render  = {({ field }) => (
              <FormItem>
                <FormLabel htmlFor='is_receive_important_only'>重要なメールのみ受信する</FormLabel>
                <FormControl>
                  <Switch id              = 'is_receive_important_only'
                          checked         = {field.value}
                          onCheckedChange = {(checked) => {
                            // こちらがONになったら、もう片方をOFFにする
                            if (checked) setValue('is_receive_all', false);
                            field.onChange(checked);
                          }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

          <Button type      = 'submit'
                  className = 'mt-6 w-full'
                  disabled  = {isSending}>
            {isSending ? <Loader2 className='size-4 animate-spin' /> : '設定を更新'}
          </Button>
        </form>
      </Form>
    </>
  );
};