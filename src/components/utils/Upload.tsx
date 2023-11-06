import { MediaRenderer, useStorageUpload } from "@thirdweb-dev/react";
import { Percent } from "@uniswap/sdk";
import { type FC, useCallback, useEffect,useMemo, useState } from "react";
import { useDropzone } from 'react-dropzone';

interface UploadProps {
  className?: string; // completely override classes
  additionalClasses?: string; // add classes to the default classes
  label?: string;
  hoverLabel?: string;
  callback?: (urls: string[]) => void;
  initialUrls?: string[];
  height?: string;
  objectCover?: boolean;
}

const ONE_HUNDRED_PERCENT = new Percent('100', '100');
const ZERO_PERCENT = new Percent('0', '100');

export const Upload: FC<UploadProps> = ({ 
  className, 
  label, 
  hoverLabel, 
  callback,
  additionalClasses,
  initialUrls,
  height,
  objectCover,
}) => {
  const [progress, setProgress] = useState<Percent>(ZERO_PERCENT);
  const [urls, setUrls] = useState<string[]>([]);
  const [preparingUpload, setPreparingUpload] = useState<boolean>(false);
  const { mutateAsync: upload } = useStorageUpload({
    onProgress: (currentProgress => {
      setProgress(new Percent(
        currentProgress.progress.toString(), 
        currentProgress.total.toString()
      ));
    })
  });

  useEffect(() => {
    if (initialUrls && initialUrls.length > 0) {
      setUrls(initialUrls);
      // callback?.(initialUrls);
    }
  }, [callback, initialUrls]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // clear the urls from state
    setUrls([]);
    setPreparingUpload(true);
    const uploadedUrls = await upload({ data: acceptedFiles });
    setPreparingUpload(false);
    setUrls(uploadedUrls);
    callback?.(uploadedUrls);
  }, [callback, upload]);
  
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { image: ["image/*"], video: ["video/*"] }});

  const currentLabel = useMemo(() => {
    if (preparingUpload) {
      return "Preparing upload...";
    }
    if (isDragActive) {
      return hoverLabel || 'Drop here!';
    }
    return label || 'Drag and drop here, or click to select';
  }, [hoverLabel, isDragActive, label, preparingUpload]);


  return (
    <div {...getRootProps()} className={className || `bg-base-200 rounded-lg ${height ? height : 'h-64'} w-full grid place-content-center cursor-pointer relative ${additionalClasses || ""}`}>
      <input {...getInputProps()} />
      {
        urls.length && urls.length > 0 && urls[0] !== "" ? (
          <div className="absolute inset-0 w-full h-full bg-cover overflow-hidden rounded-lg">
            <MediaRenderer
              src={urls[0]}
              className={`w-full h-full rounded-lg absolute z-10`}
              height="100%"
              width="100%"
              style={{ 
                objectFit: objectCover ? "cover" : "contain", 
                width: '100%', 
                height: '100%',
              }}
            />
          </div>
        ) : (
          <p>{currentLabel}</p>
        )
      }
      {progress.greaterThan(ZERO_PERCENT) && progress.lessThan(ONE_HUNDRED_PERCENT) && (
        <progress className="progress progress-primary w-full" value={progress.toFixed(2)} max="100"></progress>
      )}
    </div>
  )
};

export default Upload;