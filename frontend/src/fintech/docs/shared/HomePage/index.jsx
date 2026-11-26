import {
  ApiOutlined,
  AppstoreOutlined,
  ArrowRightOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  CodeOutlined,
  ReadOutlined,
  RobotOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { Link } from 'dumi';
import React, { useEffect, useState } from 'react';
import './style.less';

const taoTeChingQuotes = [
  {
    chapter: 1,
    text: '道可道，非常道；名可名，非常名。',
  },
  {
    chapter: 2,
    text: '天下皆知美之为美，斯恶已；皆知善之为善，斯不善已。',
  },
  {
    chapter: 3,
    text: '不尚贤，使民不争；不贵难得之货，使民不为盗。',
  },
  {
    chapter: 4,
    text: '道冲，而用之或不盈。渊兮，似万物之宗。',
  },
  {
    chapter: 5,
    text: '天地不仁，以万物为刍狗；圣人不仁，以百姓为刍狗。',
  },
  {
    chapter: 6,
    text: '谷神不死，是谓玄牝。玄牝之门，是谓天地根。',
  },
  {
    chapter: 7,
    text: '天长地久。天地所以能长且久者，以其不自生，故能长生。',
  },
  {
    chapter: 8,
    text: '上善若水。水善利万物而不争，处众人之所恶，故几于道。',
  },
  {
    chapter: 9,
    text: '持而盈之，不如其已；揣而锐之，不可长保。',
  },
  {
    chapter: 10,
    text: '载营魄抱一，能无离乎？专气致柔，能如婴儿乎？',
  },
  {
    chapter: 11,
    text: '三十辐，共一毂，当其无，有车之用。',
  },
  {
    chapter: 12,
    text: '五色令人目盲；五音令人耳聋；五味令人口爽。',
  },
  {
    chapter: 13,
    text: '宠辱若惊，贵大患若身。',
  },
  {
    chapter: 14,
    text: '视之不见，名曰夷；听之不闻，名曰希；搏之不得，名曰微。',
  },
  {
    chapter: 15,
    text: '古之善为士者，微妙玄通，深不可识。',
  },
  {
    chapter: 16,
    text: '致虚极，守静笃。万物并作，吾以观复。',
  },
  {
    chapter: 17,
    text: '太上，下知有之；其次，亲而誉之；其次，畏之；其次，侮之。',
  },
  {
    chapter: 18,
    text: '大道废，有仁义；智慧出，有大伪。',
  },
  {
    chapter: 19,
    text: '绝圣弃智，民利百倍；绝仁弃义，民复孝慈。',
  },
  {
    chapter: 20,
    text: '绝学无忧。唯之与阿，相去几何？善之与恶，相去若何？',
  },
  {
    chapter: 21,
    text: '孔德之容，惟道是从。',
  },
  {
    chapter: 22,
    text: '曲则全，枉则直，洼则盈，敝则新，少则得，多则惑。',
  },
  {
    chapter: 23,
    text: '希言自然。故飘风不终朝，骤雨不终日。',
  },
  {
    chapter: 24,
    text: '企者不立，跨者不行；自见者不明，自是者不彰。',
  },
  {
    chapter: 25,
    text: '人法地，地法天，天法道，道法自然。',
  },
  {
    chapter: 26,
    text: '重为轻根，静为躁君。',
  },
  {
    chapter: 27,
    text: '善行无辙迹，善言无瑕谪。',
  },
  {
    chapter: 28,
    text: '知其雄，守其雌，为天下溪。',
  },
  {
    chapter: 29,
    text: '将欲取天下而为之，吾见其不得已。天下神器，不可为也。',
  },
  {
    chapter: 30,
    text: '以道佐人主者，不以兵强天下，其事好还。',
  },
  {
    chapter: 31,
    text: '夫佳兵者，不祥之器，物或恶之，故有道者不处。',
  },
  {
    chapter: 32,
    text: '道常无名。朴虽小，天下莫能臣也。',
  },
  {
    chapter: 33,
    text: '知人者智，自知者明；胜人者有力，自胜者强。',
  },
  {
    chapter: 34,
    text: '大道泛兮，其可左右。万物恃之以生而不辞，功成不名有。',
  },
  {
    chapter: 35,
    text: '执大象，天下往。往而不害，安平太。',
  },
  {
    chapter: 36,
    text: '将欲歙之，必固张之；将欲弱之，必固强之。',
  },
  {
    chapter: 37,
    text: '道常无为而无不为。',
  },
  {
    chapter: 38,
    text: '上德不德，是以有德；下德不失德，是以无德。',
  },
  {
    chapter: 39,
    text: '昔之得一者：天得一以清，地得一以宁，神得一以灵。',
  },
  {
    chapter: 40,
    text: '反者道之动；弱者道之用。',
  },
  {
    chapter: 41,
    text: '大方无隅，大器晚成，大音希声，大象无形。',
  },
  {
    chapter: 42,
    text: '道生一，一生二，二生三，三生万物。',
  },
  {
    chapter: 43,
    text: '天下之至柔，驰骋天下之至坚。',
  },
  {
    chapter: 44,
    text: '知足不辱，知止不殆，可以长久。',
  },
  {
    chapter: 45,
    text: '大成若缺，其用不弊；大盈若冲，其用不穷。',
  },
  {
    chapter: 46,
    text: '天下有道，却走马以粪；天下无道，戎马生于郊。',
  },
  {
    chapter: 47,
    text: '不出户，知天下；不窥牖，见天道。',
  },
  {
    chapter: 48,
    text: '为学日益，为道日损。损之又损，以至于无为。',
  },
  {
    chapter: 49,
    text: '圣人无常心，以百姓心为心。',
  },
  {
    chapter: 50,
    text: '出生入死。生之徒十有三，死之徒十有三。',
  },
  {
    chapter: 51,
    text: '道生之，德畜之，物形之，势成之。',
  },
  {
    chapter: 52,
    text: '天下有始，以为天下母。既得其母，以知其子。',
  },
  {
    chapter: 53,
    text: '使我介然有知，行于大道，唯施是畏。',
  },
  {
    chapter: 54,
    text: '善建者不拔，善抱者不脱，子孙以祭祀不辍。',
  },
  {
    chapter: 55,
    text: '含德之厚，比于赤子。',
  },
  {
    chapter: 56,
    text: '知者不言，言者不知。',
  },
  {
    chapter: 57,
    text: '以正治国，以奇用兵，以无事取天下。',
  },
  {
    chapter: 58,
    text: '其政闷闷，其民淳淳；其政察察，其民缺缺。',
  },
  {
    chapter: 59,
    text: '治人事天，莫若啬。',
  },
  {
    chapter: 60,
    text: '治大国，若烹小鲜。',
  },
  {
    chapter: 61,
    text: '大国者下流，天下之交，天下之牝。',
  },
  {
    chapter: 62,
    text: '道者万物之奥，善人之宝，不善人之所保。',
  },
  {
    chapter: 63,
    text: '为无为，事无事，味无味。',
  },
  {
    chapter: 64,
    text: '合抱之木，生于毫末；九层之台，起于累土；千里之行，始于足下。',
  },
  {
    chapter: 65,
    text: '古之善为道者，非以明民，将以愚之。',
  },
  {
    chapter: 66,
    text: '江海所以能为百谷王者，以其善下之，故能为百谷王。',
  },
  {
    chapter: 67,
    text: '我有三宝，持而保之：一曰慈，二曰俭，三曰不敢为天下先。',
  },
  {
    chapter: 68,
    text: '善为士者不武；善战者不怒；善胜敌者不与。',
  },
  {
    chapter: 69,
    text: '吾不敢为主，而为客；不敢进寸，而退尺。',
  },
  {
    chapter: 70,
    text: '吾言甚易知，甚易行。天下莫能知，莫能行。',
  },
  {
    chapter: 71,
    text: '知不知，尚矣；不知知，病也。',
  },
  {
    chapter: 72,
    text: '民不畏威，则大威至。',
  },
  {
    chapter: 73,
    text: '勇于敢则杀，勇于不敢则活。',
  },
  {
    chapter: 74,
    text: '民不畏死，奈何以死惧之？',
  },
  {
    chapter: 75,
    text: '民之饥，以其上食税之多，是以饥。',
  },
  {
    chapter: 76,
    text: '人之生也柔弱，其死也坚强；草木之生也柔脆，其死也枯槁。',
  },
  {
    chapter: 77,
    text: '天之道，其犹张弓欤？高者抑之，下者举之。',
  },
  {
    chapter: 78,
    text: '天下莫柔弱于水，而攻坚强者莫之能胜。',
  },
  {
    chapter: 79,
    text: '和大怨，必有余怨，安可以为善？',
  },
  {
    chapter: 80,
    text: '小国寡民，使有什伯之器而不用，使民重死而不远徙。',
  },
  {
    chapter: 81,
    text: '信言不美，美言不信；善者不辩，辩者不善。',
  },
];

const weekdays = [
  '星期日',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六',
];

const getIsoWeek = (date) => {
  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const weekday = target.getUTCDay() || 7;

  target.setUTCDate(target.getUTCDate() + 4 - weekday);

  const weekYear = target.getUTCFullYear();
  const yearStart = new Date(Date.UTC(weekYear, 0, 1));
  const week = Math.ceil(((target - yearStart) / 86400000 + 1) / 7);

  return { week, weekYear };
};

const getTodayBrief = (date = new Date()) => {
  const dateKey = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  ].join('-');
  const seed = [...dateKey].reduce(
    (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );

  return {
    ...getIsoWeek(date),
    dateLabel: `${date.getFullYear()}年${
      date.getMonth() + 1
    }月${date.getDate()}日`,
    quote: taoTeChingQuotes[seed % taoTeChingQuotes.length],
    weekday: weekdays[date.getDay()],
  };
};

const TodayBrief = () => {
  const [today, setToday] = useState(null);

  useEffect(() => {
    const updateToday = () => setToday(getTodayBrief());

    updateToday();
    const timer = window.setInterval(updateToday, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="fintech-home__today"
      aria-label="今日日期、周数与道德经摘句"
      aria-live="polite"
    >
      <div className="fintech-home__today-calendar">
        <div className="fintech-home__today-icon" aria-hidden="true">
          <CalendarOutlined />
        </div>
        <div>
          <span>
            {today ? `${today.dateLabel} · ${today.weekday}` : '今日'}
          </span>
          <strong>
            {today ? `${today.weekYear} · 第 ${today.week} 周` : '正在读取日期'}
          </strong>
        </div>
      </div>

      <figure className="fintech-home__today-quote">
        <div className="fintech-home__today-quote-label">
          <ReadOutlined aria-hidden="true" />
          <span>今日一言</span>
          <small>DAILY TAO</small>
        </div>
        <blockquote>
          {today ? `「${today.quote.text}」` : '静候今日一言……'}
        </blockquote>
        <figcaption>
          {today ? `《道德经》· 第 ${today.quote.chapter} 章` : '《道德经》'}
        </figcaption>
      </figure>
    </div>
  );
};

const capabilities = [
  {
    icon: AppstoreOutlined,
    title: '业务组件',
    description: '覆盖表格、表单、抽屉、图表等高频企业级场景。',
    link: '/components/link-btn',
    meta: '40+ Components',
  },
  {
    icon: ToolOutlined,
    title: '工具方法',
    description: '沉淀请求、存储、日期和浏览器能力的通用实现。',
    link: '/utils/clipboard',
    meta: '20+ Utilities',
  },
  {
    icon: RobotOutlined,
    title: 'AI Agents',
    description: '面向项目开发的智能助手、能力路由与技能体系。',
    link: '/agents',
    meta: 'Agent Ready',
  },
  {
    icon: RocketOutlined,
    title: 'Pro 框架',
    description: '统一项目配置、权限、布局与工程实践的最佳路径。',
    link: '/pro',
    meta: 'Production First',
  },
  {
    icon: ApiOutlined,
    title: 'Web API',
    description: '快速查阅现代浏览器原生能力与兼容性说明。',
    link: 'https://developer.mozilla.org/zh-CN/docs/Web/API',
    meta: 'MDN Reference',
  },
  {
    icon: CodeOutlined,
    title: '图表方案',
    description: '基于 Ant Design Charts 构建清晰可靠的数据表达。',
    link: 'https://ant-design-charts.antgroup.com/examples',
    meta: 'Data Visualized',
  },
];

const quickLinks = [
  { title: 'Day.js 用例', description: '项目常用日期处理方案', link: '/dayjs' },
  { title: '业务枚举', description: '统一维护常见业务状态', link: '/enum' },
];

const renderLink = (link, children, className, label) => {
  const external = /^https?:\/\//.test(link);

  if (external) {
    return (
      <a
        aria-label={label}
        className={className}
        href={link}
        key={label}
        rel="noreferrer"
        target="_blank"
      >
        {children}
      </a>
    );
  }

  return (
    <Link aria-label={label} className={className} key={label} to={link}>
      {children}
    </Link>
  );
};

export default function HomePage() {
  return (
    <div className="fintech-home">
      <section className="fintech-home__hero">
        <div className="fintech-home__hero-glow" aria-hidden="true" />
        <div className="fintech-home__container">
          <TodayBrief />
        </div>
        <div className="fintech-home__container fintech-home__hero-grid">
          <div className="fintech-home__hero-content">
            <div className="fintech-home__eyebrow">
              <span className="fintech-home__eyebrow-dot" />
              FINTECH COMPONENT SYSTEM
            </div>
            <h1>
              让复杂业务，
              <span>拥有简单答案。</span>
            </h1>
            <p className="fintech-home__hero-description">
              基于 Ant Design 6
              的企业级组件与工程实践，为团队提供一致、可靠、可复用的前端能力。
            </p>
            <div className="fintech-home__hero-actions">
              <Link
                className="fintech-home__button fintech-home__button--primary"
                to="/components/link-btn"
              >
                开始使用
                <ArrowRightOutlined />
              </Link>
              <Link
                className="fintech-home__button fintech-home__button--secondary"
                to="/pro"
              >
                了解 Pro 框架
              </Link>
            </div>
            <div className="fintech-home__hero-points" aria-label="产品特性">
              <span>
                <CheckCircleFilled /> 业务场景优先
              </span>
              <span>
                <CheckCircleFilled /> TypeScript 友好
              </span>
              <span>
                <CheckCircleFilled /> 持续维护
              </span>
            </div>
          </div>

          <div
            className="fintech-home__preview"
            aria-label="Fintech 组件能力预览"
          >
            <div className="fintech-home__preview-window">
              <div className="fintech-home__preview-bar">
                <span />
                <span />
                <span />
                <div>fintech / workspace</div>
              </div>
              <div className="fintech-home__preview-body">
                <aside>
                  <div className="fintech-home__preview-brand">F</div>
                  <span className="is-active" />
                  <span />
                  <span />
                  <span />
                </aside>
                <div className="fintech-home__preview-main">
                  <div className="fintech-home__preview-heading">
                    <div>
                      <small>OVERVIEW</small>
                      <strong>业务数据概览</strong>
                    </div>
                    <button type="button">创建任务</button>
                  </div>
                  <div className="fintech-home__metric-grid">
                    <div>
                      <small>今日处理</small>
                      <strong>2,486</strong>
                      <em>+12.8%</em>
                    </div>
                    <div>
                      <small>完成率</small>
                      <strong>96.4%</strong>
                      <em>稳定</em>
                    </div>
                    <div>
                      <small>平均耗时</small>
                      <strong>1.8h</strong>
                      <em>-18 min</em>
                    </div>
                  </div>
                  <div className="fintech-home__chart-card">
                    <div className="fintech-home__chart-meta">
                      <span>近 7 日任务趋势</span>
                      <small>实时更新</small>
                    </div>
                    <div className="fintech-home__chart" aria-hidden="true">
                      {[42, 58, 47, 72, 64, 84, 92].map((height, index) => (
                        <span
                          key={height}
                          style={{
                            '--bar-height': `${height}%`,
                            '--bar-delay': `${index * 60}ms`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="fintech-home__floating-card fintech-home__floating-card--top">
              <ThunderboltOutlined />
              <div>
                <strong>快速集成</strong>
                <span>少写重复代码</span>
              </div>
            </div>
            <div className="fintech-home__floating-card fintech-home__floating-card--bottom">
              <SafetyCertificateOutlined />
              <div>
                <strong>可靠实践</strong>
                <span>经过业务验证</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="fintech-home__stats" aria-label="项目数据">
        <div className="fintech-home__container fintech-home__stats-grid">
          <div>
            <strong>40+</strong>
            <span>业务组件</span>
          </div>
          <div>
            <strong>20+</strong>
            <span>工具与 Hooks</span>
          </div>
          <div>
            <strong>Ant Design 6</strong>
            <span>现代技术栈</span>
          </div>
          <div>
            <strong>AI Ready</strong>
            <span>智能开发能力</span>
          </div>
        </div>
      </section>

      <section className="fintech-home__section">
        <div className="fintech-home__container">
          <div className="fintech-home__section-heading">
            <div>
              <span>CAPABILITIES</span>
              <h2>从组件到工程，覆盖开发全链路</h2>
            </div>
            <p>
              聚焦真实业务中的高频问题，让团队把精力留给产品价值，而不是重复实现。
            </p>
          </div>
          <div className="fintech-home__capability-grid">
            {capabilities.map(
              ({ icon: Icon, title, description, link, meta }) =>
                renderLink(
                  link,
                  <>
                    <div className="fintech-home__capability-icon">
                      <Icon />
                    </div>
                    <span className="fintech-home__capability-meta">
                      {meta}
                    </span>
                    <h3>{title}</h3>
                    <p>{description}</p>
                    <span className="fintech-home__capability-action">
                      查看详情 <ArrowRightOutlined />
                    </span>
                  </>,
                  'fintech-home__capability-card',
                  `查看${title}`,
                ),
            )}
          </div>
        </div>
      </section>

      <section className="fintech-home__section fintech-home__section--workflow">
        <div className="fintech-home__container fintech-home__workflow-grid">
          <div className="fintech-home__workflow-copy">
            <span>DESIGNED FOR DELIVERY</span>
            <h2>统一体验，也统一交付效率</h2>
            <p>
              遵循清晰的组件约定和工程边界，降低多人协作中的理解成本，让项目更快进入稳定状态。
            </p>
            <ul>
              <li>
                <CheckCircleFilled />
                <div>
                  <strong>一致的设计语言</strong>
                  <span>减少页面之间的体验偏差</span>
                </div>
              </li>
              <li>
                <CheckCircleFilled />
                <div>
                  <strong>可组合的业务能力</strong>
                  <span>按场景灵活组合，而不是复制代码</span>
                </div>
              </li>
              <li>
                <CheckCircleFilled />
                <div>
                  <strong>可查阅的实践文档</strong>
                  <span>示例、配置与注意事项集中维护</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="fintech-home__code-card">
            <div className="fintech-home__code-header">
              <div>
                <span />
                <span />
                <span />
              </div>
              <span>example.tsx</span>
            </div>
            <pre aria-label="Fintech 组件使用示例">
              <code>
                <span className="token-keyword">import</span>{' '}
                {'{ ProTableAsync }'}{' '}
                <span className="token-keyword">from</span>{' '}
                <span className="token-string">{"'fintech'"}</span>;
                <br />
                <br />
                <span className="token-keyword">export default</span> () =&gt; (
                <span className="token-tag">&lt;ProTableAsync</span>
                <span className="token-prop"> columns</span>={'{columns}'}
                <span className="token-prop"> request</span>={'{queryList}'}
                <span className="token-prop"> rowKey</span>=
                <span className="token-string">{'"id"'}</span>
                <span className="token-tag">/&gt;</span>
                );
              </code>
            </pre>
            <div className="fintech-home__code-result">
              <CheckCircleFilled /> 类型安全，开箱即用
            </div>
          </div>
        </div>
      </section>

      <section className="fintech-home__section fintech-home__section--resources">
        <div className="fintech-home__container">
          <div className="fintech-home__resource-panel">
            <div className="fintech-home__resource-intro">
              <BookOutlined />
              <div>
                <span>QUICK ACCESS</span>
                <h2>继续探索项目资源</h2>
                <p>查看近期变化、常用日期方案与统一业务枚举。</p>
              </div>
            </div>
            <div className="fintech-home__resource-links">
              {quickLinks.map((item) => (
                <Link key={item.title} to={item.link}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </div>
                  <ArrowRightOutlined />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
