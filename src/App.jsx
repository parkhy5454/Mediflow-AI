// // src/App.jsx
// import React, { useState } from 'react';
// import Header from './components/Layout/Header';
// import Navigation from './components/Layout/Navigation';
// import Dashboard from './components/Dashboard/Dashboard';
// import NurseManagement from './components/NurseManagement/NurseManagement';
// import RosterView from './components/Roster/RosterView';
// import Settings from './components/Settings/Settings';
// import { useNurses } from './hooks/useNurses';
// import { useRoster } from './hooks/useRoster';
// import { useRosterConfig } from './hooks/useRosterConfig';
// import Footer from './footer'

// const HospitalRosterSystem = () => {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

//   // Custom hooks for state management
//   const {
//     nurses,
//     addNurse,
//     updateNurseStatus,
//     deleteNurse,
//     getActiveNurses,
//     getFilteredNurses
//   } = useNurses();

//   const {
//     roster,
//     generateBalancedRoster,
//     getCurrentMonthRoster,
//     getRosterStats,
//     generateNurseAssignmentChart
//   } = useRoster(nurses, selectedMonth, selectedYear);

//   const { rosterConfig, updateRosterConfig } = useRosterConfig();

//   const sharedProps = {
//     nurses,
//     activeNurses: getActiveNurses(),
//     roster,
//     selectedMonth,
//     selectedYear,
//     setSelectedMonth,
//     setSelectedYear,
//     rosterConfig
//   };

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
//       <Header activeNurses={getActiveNurses()} />

//       <Navigation 
//         activeTab={activeTab} 
//         setActiveTab={setActiveTab} 
//       />

//       <div>
//         {activeTab === 'dashboard' && (
//           <Dashboard 
//             {...sharedProps}
//             getRosterStats={getRosterStats}
//             generateNurseAssignmentChart={generateNurseAssignmentChart}
//           />
//         )}

//         {activeTab === 'nurses' && (
//           <NurseManagement 
//             nurses={nurses}
//             addNurse={addNurse}
//             updateNurseStatus={updateNurseStatus}
//             deleteNurse={deleteNurse}
//             getFilteredNurses={getFilteredNurses}
//           />
//         )}

//         {activeTab === 'roster' && (
//           <RosterView 
//             {...sharedProps}
//             generateBalancedRoster={() => generateBalancedRoster(rosterConfig)}
//             getCurrentMonthRoster={getCurrentMonthRoster}
//           />
//         )}

//         {activeTab === 'settings' && (
//           <Settings 
//             rosterConfig={rosterConfig}
//             updateRosterConfig={updateRosterConfig}
//           />
//         )}
//       </div>
//       <Footer/>
//     </div>

//   );
// };

// export default HospitalRosterSystem;



// src/App.jsx (Updated with Export Support)
import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import Login from './components/Auth/Login';
import ForcedPasswordChange from './components/Auth/ForcedPasswordChange';
import FeedbackButton from './components/Feedback/FeedbackButton';
import ShareInviteButton from './components/Common/ShareInviteButton';
import { useNurses } from './hooks/useNurses';
import { useRoster } from './hooks/useRoster';
import { useRosterConfig } from './hooks/useRosterConfig';
import { initKakao } from './utils/kakaoShare';
import { clearOfflineApiCache } from './utils/offlineCache';
import i18n from './i18n';

import { useTranslation } from 'react-i18next';

// 모듈 스코프(컴포넌트 바깥)에서는 useTranslation 훅을 쓸 수 없으므로 i18n 인스턴스를 직접 사용.
const tGlobal = (...args) => i18n.t(...args);

// [코드 스플리팅] 로그인 직후 화면(대시보드)을 제외한 각 탭 화면은 실제로 그 탭을 열 때만 필요하므로
// 번들에 처음부터 다 포함시키지 않고 React.lazy로 필요할 때 별도 청크로 내려받는다.
// 초기 로딩 속도(특히 모바일 회선)를 개선하기 위한 변경이며, 각 컴포넌트의 동작 자체는 그대로다.
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const NurseManagement = lazy(() => import('./components/NurseManagement/NurseManagement'));
const RosterView = lazy(() => import('./components/Roster/RosterView'));
const Settings = lazy(() => import('./components/Settings/Settings'));
const MemberManagement = lazy(() => import('./components/Members/MemberManagement'));
const SwapRequests = lazy(() => import('./components/Roster/SwapRequests'));
const LeaveRequests = lazy(() => import('./components/Roster/LeaveRequests'));
const SubscriptionView = lazy(() => import('./components/Subscription/SubscriptionView'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));

// 탭 전환 시 다음 청크가 내려오는 짧은 동안 보여줄 로딩 표시
const TabLoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 20px', color: '#9ca3af', fontSize: '14px' }}>
    {tGlobal('불러오는 중...')}
  </div>
);

const HospitalRosterSystem = () => {
  const { t } = useTranslation();
  // [추가] 로그인 상태 관리. 새로고침해도 로그인이 풀리지 않도록 localStorage에 저장해둔다.
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // [추가] 카카오톡 공유 기능(공유/초대 버튼)을 위한 카카오 SDK 초기화. 키가 없으면 조용히 건너뛴다.
  useEffect(() => {
    initKakao();
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem('mediflow_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        window.localStorage.removeItem('mediflow_user');
      }
    }
    setAuthChecked(true);
  }, []);

  const handleLoginSuccess = (user) => {
    window.localStorage.setItem('mediflow_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('mediflow_user');
    setCurrentUser(null);
    // [추가] 오프라인 지원용으로 캐싱해둔 조회 데이터(근무표/간호사 목록 등)를 로그아웃 시
    // 함께 지운다 — 같은 기기를 다른 계정이 이어서 쓸 때 이전 사용자 데이터가 잠깐이라도
    // 보이는 걸 막기 위함.
    clearOfflineApiCache();
  };

  // [추가] 셀프 관리자 승격 등, 로그인 이후 currentUser의 일부 필드(예: role)가 바뀌었을 때
  // 화면 상태와 localStorage를 함께 갱신하기 위한 헬퍼.
  const handleUserUpdate = (updates) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const merged = { ...prev, ...updates };
      window.localStorage.setItem('mediflow_user', JSON.stringify(merged));
      return merged;
    });
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  // [추가] 근무표를 병원 전체가 아니라 부서(병동)별로 따로 관리하기 위한 선택 상태.
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // [추가] 토스페이먼츠 카드 등록 결제창에서 돌아왔을 때(authKey/customerKey가 URL에 붙어서 옴)
  // 서버에 빌링키 발급을 요청하고, 구독 관리 탭으로 이동시킨다.
  useEffect(() => {
    if (!currentUser) return;
    const params = new URLSearchParams(window.location.search);
    const authKey = params.get('authKey');
    const customerKey = params.get('customerKey');
    const billingAuth = params.get('billingAuth');

    if (authKey && customerKey) {
      (async () => {
        try {
          const res = await fetch('/api/subscription/register-card', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
            body: JSON.stringify({ authKey, customerKey })
          });
          const data = await res.json();
          if (res.ok) {
            alert(t('카드가 정상적으로 등록되었습니다.'));
          } else {
            alert(data.error || t('카드 등록에 실패했습니다.'));
          }
        } catch (err) {
          alert(t('카드 등록 중 오류가 발생했습니다.'));
        } finally {
          window.history.replaceState({}, '', window.location.pathname);
          setActiveTab('subscription');
        }
      })();
    } else if (billingAuth === 'fail') {
      alert(t('카드 등록이 취소되었거나 실패했습니다.'));
      window.history.replaceState({}, '', window.location.pathname);
      setActiveTab('subscription');
    } else if (params.get('prepayYears') && params.get('paymentKey') && params.get('orderId') && params.get('amount')) {
      const years = params.get('prepayYears');
      const paymentKey = params.get('paymentKey');
      const orderId = params.get('orderId');
      const amount = params.get('amount');
      (async () => {
        try {
          const res = await fetch('/api/subscription/prepay/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
            body: JSON.stringify({ years, paymentKey, orderId, amount })
          });
          const data = await res.json();
          if (res.ok) {
            alert(t('{{years}}년 선결제가 완료되었습니다. ({{prepaidUntil}}까지 적용)', { years, prepaidUntil: data.prepaidUntil }));
          } else {
            alert(data.error || t('선결제 처리에 실패했습니다.'));
          }
        } catch (err) {
          alert(t('선결제 처리 중 오류가 발생했습니다.'));
        } finally {
          window.history.replaceState({}, '', window.location.pathname);
          setActiveTab('subscription');
        }
      })();
    } else if (params.get('prepayFail')) {
      alert(t('선결제가 취소되었거나 실패했습니다.'));
      window.history.replaceState({}, '', window.location.pathname);
      setActiveTab('subscription');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // Custom hooks for state management
  const {
    nurses,
    addNurse,
    updateNurseStatus,
    updateNurse,
    deleteNurse,
    getActiveNurses,
    getFilteredNurses,
    updateNurses
  } = useNurses(currentUser);

  // [추가] 간호사들에 등록된 부서(병동) 목록을 자동으로 뽑아낸다. 부서가 비어있는 간호사는
  // "미지정"으로 묶인다. 목록이 바뀌면(간호사 새로 추가 등) 자동으로 갱신된다.
  const departmentOptions = Array.from(
    new Set(nurses.map(n => n.department || ''))
  ).sort((a, b) => {
    if (a === '') return 1; // "미지정"은 맨 뒤로
    if (b === '') return -1;
    return a.localeCompare(b, 'ko');
  });

  // 아직 부서를 선택 안 했거나, 선택했던 부서가 더 이상 존재하지 않으면(간호사 목록이 바뀌어서)
  // 목록의 첫 번째 부서로 자동 이동한다.
  useEffect(() => {
    if (departmentOptions.length === 0) return;
    if (!departmentOptions.includes(selectedDepartment)) {
      setSelectedDepartment(departmentOptions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentOptions.join('|')]);

  const {
    roster,
    rosterMeta,
    generateBalancedRoster,
    getCurrentMonthRoster,
    getRosterStats,
    generateNurseAssignmentChart,
    clearRoster,
    hasRosterData,
    refetchRoster,
    publishRoster,
    unpublishRoster
  } = useRoster(nurses, selectedMonth, selectedYear, updateNurses, currentUser, selectedDepartment);

  const { rosterConfig, updateRosterConfig } = useRosterConfig(currentUser, selectedDepartment);

  const sharedProps = {
    nurses,
    activeNurses: getActiveNurses(),
    roster,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    rosterConfig,
    getCurrentMonthRoster,
    refetchRoster,
    departmentOptions,
    selectedDepartment,
    setSelectedDepartment,
    currentUser
  };

  // 로그인 여부를 확인하는 동안 잠깐 빈 화면 (깜빡임 방지)
  if (!authChecked) {
    return null;
  }

  // [추가] 로그인 안 된 상태면 로그인/회원가입 화면만 보여준다.
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // [추가] 관리자/운영자가 비밀번호를 초기화해준 계정이면, 새 비밀번호를 설정하기 전까지
  // 다른 화면을 못 보게 막는다.
  if (currentUser.mustChangePassword) {
    return (
      <ForcedPasswordChange
        currentUser={currentUser}
        onChanged={(updatedUser) => handleUserUpdate(updatedUser)}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header activeNurses={getActiveNurses()} currentUser={currentUser} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
      
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
      />

      <Suspense fallback={<TabLoadingFallback />}>
      <div>
        {activeTab === 'dashboard' && (
          <Dashboard
            {...sharedProps}
            getRosterStats={getRosterStats}
            generateNurseAssignmentChart={generateNurseAssignmentChart}
          />
        )}
        
        {activeTab === 'nurses' && (
          <NurseManagement 
            nurses={nurses}
            addNurse={addNurse}
            updateNurseStatus={updateNurseStatus}
            updateNurse={updateNurse}
            deleteNurse={deleteNurse}
            getFilteredNurses={getFilteredNurses}
            currentUser={currentUser}
          />
        )}
        
        {activeTab === 'roster' && (
          <RosterView 
            {...sharedProps}
            currentUser={currentUser}
            generateBalancedRoster={(approvedLeaves) => generateBalancedRoster(rosterConfig, approvedLeaves)}
            clearRoster={() => clearRoster(selectedMonth, selectedYear)}
            rosterMeta={rosterMeta}
            publishRoster={publishRoster}
            unpublishRoster={unpublishRoster}
          />
        )}

        {activeTab === 'swap-requests' && (
          <SwapRequests
            {...sharedProps}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'leave-requests' && (
          <LeaveRequests currentUser={currentUser} nurses={nurses} departmentOptions={departmentOptions} selectedDepartment={selectedDepartment} setSelectedDepartment={setSelectedDepartment} />
        )}

        {activeTab === 'members' && (
          <MemberManagement currentUser={currentUser} onUserUpdate={handleUserUpdate} />
        )}

        {activeTab === 'subscription' && (
          <SubscriptionView currentUser={currentUser} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard currentUser={currentUser} />
        )}
        
        {activeTab === 'settings' && (
          <Settings 
            rosterConfig={rosterConfig}
            updateRosterConfig={updateRosterConfig}
            departmentOptions={departmentOptions}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
          />
        )}
      </div>
      </Suspense>

      <ShareInviteButton currentUser={currentUser} />
      <FeedbackButton currentUser={currentUser} />
    </div>
  );
};

export default HospitalRosterSystem;