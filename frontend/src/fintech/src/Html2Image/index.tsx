import { useId } from 'react';
import useHtml2Image from '../hooks/useHtml2Image';
import LinkBtn from '../LinkBtn';
import useStyles from './style';

type Html2ImageProps = {
  children: React.ReactNode;
  filename?: string;
};

const Html2Image = (props: Html2ImageProps) => {
  const { children, filename } = props;

  const id = useId();
  const { loading, onImage } = useHtml2Image();
  const { styles } = useStyles();

  return (
    <div className={styles.container}>
      {!loading && (
        <div
          className={styles.action}
          onClick={() => {
            onImage(document.getElementById(id), filename);
          }}
        >
          <LinkBtn success>下载</LinkBtn>
        </div>
      )}
      <div id={id} className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default Html2Image;
