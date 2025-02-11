'use client';

// react
import { useState, type ReactElement } from 'react';
// hookform
import {
  patchUserProfile,
  userProfileFormSchema,
  type UserProfileResponseData,
  type UserProfileFormInputType,
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
import { Input } from '@/app/components/ui/shadcn/input';
import { Alert, AlertDescription } from '@/app/components/ui/shadcn/alert';
// icons
import { Loader2 } from 'lucide-react';
// components
import { showToast, CropperDialog, OverlaySpinner } from '@/app/components/utils';


// UserProfileEditForm
export function UserProfileEditForm({userProfileData,}: {userProfileData: UserProfileResponseData;}): ReactElement {

  // userIconUrl
  // - null の時はフロントのデフォルト画像を表示
  const userIconUrl = userProfileData.userIcon
                        ? (process.env.NEXT_PUBLIC_BACKEND_URL as string) + userProfileData.userIcon
                        : '/app/accounts/profile/user_icon/default/default.svg';

  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const [userIconPreviewUrl, setUserIconPreviewUrl] = useState<string>(userIconUrl);

  // ++++++++++
  // form
  // - useForm
  const form = useForm<UserProfileFormInputType>({
    resolver: zodResolver(userProfileFormSchema),
    defaultValues: {
      display_name: userProfileData.displayName,
      user_icon:    null,
    },
  });
  // - onSubmit
  const onSubmit: SubmitHandler<UserProfileFormInputType> = async (data) => {

    // 多重送信防止
    if (isSending) return;

    setIsSending(true);
    setErrorMsg('');
    try {
      // multipart/form-data 用 ▽
      const formData = new FormData();
      formData.append('display_name', data.display_name);
      if (data.user_icon instanceof File) {
        formData.append('user_icon', data.user_icon);
      };
      // multipart/form-data 用 △
      const result = await patchUserProfile(formData);
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

  // CropperDialog からファイル受け取り
  const handleCropped = (croppedFile: File) => {
    form.setValue('user_icon', croppedFile);
    setUserIconPreviewUrl(URL.createObjectURL(croppedFile));
  };

  // clear
  const handleClear = () => {
    form.setValue('user_icon', null);
    setUserIconPreviewUrl(userIconUrl);
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
              className='space-y-6'>

          {/* user_icon (Preview) */}
          <div className='flex flex-col gap-2'>
            <p className='text-left text-sm font-semibold text-foreground/80'>
              プロフィール画像
            </p>
            <div className='relative mx-auto size-[200px] overflow-hidden rounded-full border'>
              <img src       = {userIconPreviewUrl}
                   alt       = 'icon preview'
                   className = 'size-[200px] object-cover' />
            </div>
          </div>
          {/* user_icon (CropperDialog) */}
          <div className='flex flex-col gap-1'>
            <div className='flex w-full items-center gap-2'>
              <CropperDialog onCropped = {handleCropped}
                             className = 'flex-1 border-muted-foreground' />
              <Button variant   = 'outline'
                      type      = 'button'
                      className = 'bg-secondary'
                      onClick   = {handleClear}>
                clear
              </Button>
            </div>
            <p className='text-xs text-muted-foreground'>
              200 (px) x 200 (px) にリサイズされます
            </p>
          </div>

          {/* display_name (Input) */}
          <FormField control = {form.control}
                     name    = 'display_name'
                     render  = {({ field }) => (
              <FormItem>
                <FormLabel htmlFor='display_name'>ユーザネーム</FormLabel>
                <FormControl>
                  <Input {...field}
                         id          = 'display_name'
                         className   = 'border-muted-foreground'
                         placeholder = '' />
                </FormControl>
                <p className='mt-1 text-xs text-muted-foreground'>
                  半角英数字 25文字以下
                </p>
                <FormMessage />
              </FormItem>
            )} />

          <Button type      = 'submit'
                  className = 'w-full'
                  disabled  = {isSending}>
            {isSending ? <Loader2 className='size-4 animate-spin' /> : '設定を更新'}
          </Button>
        </form>
      </Form>
    </>
  );
};