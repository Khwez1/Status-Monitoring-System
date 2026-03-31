interface EmailTemplateProps {
  status: string;
  message: string;
}

export function EmailTemplate({ status, message }: EmailTemplateProps) {
  return (
    <div className='font-serif text-[16px]'>
      <p className='pt-4 border-t'>Hi, subscriber!</p>
      <p>
        ${message}
        <br />
        <strong>Status:</strong> ${status}
        <br />
        <strong>Time:</strong> ${new Date().toISOString()}
      </p>
      <p className='pt-4 border-t'>Best regards,<br /> Downtime</p>
    </div>
  );
}