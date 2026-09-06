// src/legal/termsText.js
// 이용약관 / 개인정보처리방침 전문. 회원가입 화면의 동의 모달(TermsModal.jsx)에서 사용.
// [중요] 표준 SaaS 양식을 기반으로 한 초안입니다. 실제 유료 서비스 오픈 전 변호사 검토 권장.
// 영어/중국어 버전은 한국어 원문의 번역본이며, 법적 효력은 한국어 원문을 기준으로 합니다.

export const COMPANY_NAME = '(주)카이저솔루션';
export const COMPANY_PHONE = '02-971-0954';
export const COMPANY_EMAIL = 'hypark@kaisersolution.com';
export const SERVICE_NAME = 'Mediflow-AI (병원 간호사 근무 관리 시스템)';

export const TERMS_OF_SERVICE = `
제1조 (목적)
이 약관은 ${COMPANY_NAME}(이하 "회사")가 제공하는 ${SERVICE_NAME}(이하 "서비스")의 이용과 관련하여
회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. "서비스"란 회사가 제공하는 병원 간호사 근무표 생성·관리, 근무 변경 요청, 관련 통계 제공 등의
   웹 기반 소프트웨어 일체를 말합니다.
2. "이용자"란 이 약관에 따라 서비스를 이용하는 병원 소속 회원(관리자·일반 사용자)을 말합니다.
3. "병원 코드"란 같은 병원 소속임을 식별하기 위해 이용자가 회원가입 시 입력하는 코드를 말합니다.

제3조 (약관의 효력 및 변경)
1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.
2. 회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있으며, 변경 시 적용일자 및
   변경사유를 명시하여 최소 7일 전(이용자에게 불리한 변경은 30일 전)에 공지합니다.

제4조 (회원가입)
1. 이용자는 회사가 정한 절차에 따라 이메일, 비밀번호, 이름, 병원명, 병원 코드 등을 입력하여
   회원가입을 신청합니다. 전화번호는 선택 입력 사항입니다.
2. 같은 병원 코드로 가입한 이용자는 같은 병원 소속으로 간주되어 근무표 등 데이터가 공유됩니다.
   따라서 병원 코드는 소속 임직원에게만 정확히 전달해야 하며, 이를 임의로 유출하여 발생하는
   문제에 대해 회사는 책임지지 않습니다.
3. 병원 코드로 최초 등록되는 관리자 또는 회원 간 합의된 절차에 따라 지정된 관리자는, 같은 병원
   소속 회원의 권한(관리자/일반 사용자) 관리 및 근무표 관리에 대한 책임을 집니다.

제5조 (서비스의 제공 및 변경)
1. 회사는 다음과 같은 서비스를 제공합니다.
   가. 4교대 근무표 자동 생성 및 관리
   나. 간호사 정보 관리
   다. 근무 변경(맞교환/대타) 요청 및 승인 처리
   라. 근무표 통계 및 내보내기(PDF/엑셀)
   마. 기타 회사가 추가로 개발하거나 제휴를 통해 제공하는 서비스
2. 회사는 서비스의 내용을 변경할 수 있으며, 이 경우 변경 내용을 사전에 공지합니다.
3. 회사는 시스템 점검, 서버 장애, 기타 불가항력적 사유로 서비스 제공을 일시적으로 중단할 수 있습니다.

제6조 (이용자의 의무)
1. 이용자는 관계 법령, 이 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항 등을 준수해야 합니다.
2. 이용자는 자신의 계정 정보(이메일, 비밀번호)를 제3자에게 공유하거나 대여할 수 없으며,
   계정 도용 등 비정상적인 사용을 발견한 경우 즉시 회사에 통지해야 합니다.
3. 이용자는 실제 근무하는 병원의 정확한 정보를 입력해야 하며, 허위 정보 입력으로 인해 발생하는
   문제에 대한 책임은 이용자 본인에게 있습니다.
4. 이용자는 다른 이용자의 개인정보를 무단으로 수집, 저장, 유출해서는 안 됩니다.

제7조 (서비스 이용의 제한)
회사는 이용자가 다음 각 호에 해당하는 행위를 한 경우 사전 통지 없이 서비스 이용을 제한하거나
계정을 정지할 수 있습니다.
1. 타인의 개인정보를 도용하거나 허위 정보를 등록한 경우
2. 서비스의 안정적 운영을 방해하는 행위를 한 경우
3. 관계 법령 또는 이 약관을 위반한 경우

제8조 (책임 제한)
1. 회사는 천재지변, 불가항력적 사유로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.
2. 회사는 이용자가 입력한 정보(근무표 배정, 간호사 정보 등)의 정확성에 대해 보증하지 않으며,
   서비스가 제공하는 자동 근무표 생성 결과는 참고용으로, 최종 근무표 확정 및 실제 인력 운영에
   대한 책임은 각 병원(이용자)에 있습니다.
3. 회사는 이용자 상호간 또는 이용자와 제3자 상호간에 서비스를 매개로 발생한 분쟁에 대해
   개입할 의무가 없으며, 이로 인한 손해를 배상할 책임도 없습니다.

제9조 (계약 해지 및 이용 제한)
이용자는 언제든지 서비스 내 문의 또는 아래 연락처를 통해 회원 탈퇴를 요청할 수 있으며,
회사는 관계 법령이 정하는 바에 따라 이를 처리합니다.

제10조 (분쟁 해결)
이 약관과 관련한 분쟁은 대한민국 법령을 준거법으로 하며, 회사의 본점 소재지를 관할하는
법원을 관할 법원으로 합니다.

부칙
이 약관은 2026년 8월 2일부터 시행합니다.

사업자 정보
- 상호: ${COMPANY_NAME}
- 대표 연락처: ${COMPANY_PHONE}
- 이메일: ${COMPANY_EMAIL}
`.trim();

export const PRIVACY_POLICY = `
${COMPANY_NAME}(이하 "회사")는 「개인정보보호법」 등 관련 법령을 준수하며, 이용자의 개인정보를
안전하게 처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.

1. 수집하는 개인정보 항목 및 수집 방법
가. 회원가입 시
   - 필수: 이메일(아이디), 비밀번호(암호화 저장), 이름, 병원명, 병원 코드
   - 선택: 전화번호
나. 서비스 이용 과정에서 자동 생성·수집되는 정보
   - 접속 로그, 서비스 이용 기록(근무표 생성/수정 이력, 관리자 활동 로그 등)
다. 문의하기 이용 시
   - 문의 내용, 이메일, 선택 시 연락처
라. 병원 관리자가 입력하는 간호사 정보 (간호사 본인이 회원가입 계정을 갖지 않는 경우 포함)
   - 이름, 자격구분, 경력, 부서 등 근무표 배정에 필요한 최소한의 정보. 이 정보는 각 병원
     관리자의 책임 하에 입력되며, 회사는 그 정확성을 보증하지 않습니다.

2. 개인정보의 수집 및 이용 목적
- 회원 식별 및 로그인, 병원 단위 서비스 제공
- 근무표 생성·관리, 근무 변경(맞교환/대타) 요청 처리
- 문의 접수 및 답변, 공지사항 전달
- 부정 이용 방지 및 서비스 안정적 운영(비밀번호 초기화, 관리자 활동 기록 등)

3. 개인정보의 보유 및 이용 기간
- 회원 탈퇴 시 지체 없이 파기함을 원칙으로 합니다.
- 단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 법령이 정한 기간 동안 보관합니다.
- 문의 내역은 처리 완료 후 3년간 보관 후 파기합니다.

4. 개인정보의 제3자 제공
회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 이용자가 사전에 동의하거나
법령에 특별한 규정이 있는 경우는 예외로 합니다.

5. 개인정보 처리의 위탁
회사는 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁하고 있으며, 위탁계약 체결 시
개인정보가 안전하게 관리되도록 필요한 사항을 규정합니다.
- 데이터베이스 및 인증 처리: Supabase, Inc. (해외 서버 이용 가능)
- 서버 호스팅: Render Services, Inc. (해외 서버 이용 가능)
- 에러 모니터링: Sentry (Functional Software, Inc.) (해외 서버 이용 가능)
※ 위 위탁업체의 서버가 국외에 소재할 수 있어, 개인정보가 국외로 이전·보관될 수 있습니다.

6. 이용자의 권리와 행사 방법
이용자는 언제든지 자신의 개인정보를 조회, 수정할 수 있으며(서비스 내 "내 정보 수정"),
회원 탈퇴 및 개인정보 삭제를 요청할 수 있습니다. 요청은 아래 연락처로 접수받습니다.

7. 개인정보의 파기
회사는 개인정보 보유기간이 경과하거나 처리 목적이 달성된 경우 해당 개인정보를 지체 없이
파기합니다. 전자적 파일 형태의 정보는 복구 불가능한 방법으로 영구 삭제합니다.

8. 개인정보 보호책임자
- 성명/부서: ${COMPANY_NAME} 개인정보보호 담당
- 연락처: ${COMPANY_PHONE} / ${COMPANY_EMAIL}

9. 고지의 의무
이 개인정보처리방침의 내용 추가, 삭제 및 수정이 있을 경우 시행 최소 7일 전에 서비스 내
공지사항을 통해 고지합니다.

시행일자: 2026년 8월 2일
`.trim();

// ------------------------------------------------------------------
// 영어 번역본 (한국어 원문의 번역이며, 법적 효력은 한국어 원문 기준)
// ------------------------------------------------------------------
export const TERMS_OF_SERVICE_EN = `
Article 1 (Purpose)
These Terms govern the rights, obligations, and other necessary matters between ${COMPANY_NAME}
("the Company") and users in connection with the use of ${SERVICE_NAME} ("the Service") provided
by the Company.

Article 2 (Definitions)
1. "Service" means all web-based software provided by the Company for creating and managing
   hospital nurse rosters, shift-change requests, and related statistics.
2. "User" means a hospital-affiliated member (administrator or general user) who uses the Service
   under these Terms.
3. "Hospital Code" means the code entered by a user at sign-up to identify affiliation with the
   same hospital.

Article 3 (Effect and Amendment of the Terms)
1. These Terms take effect by being posted on the Service screen or otherwise notified to users.
2. The Company may amend these Terms to the extent permitted by applicable law, announcing the
   effective date and reason for any amendment at least 7 days in advance (30 days in advance for
   changes unfavorable to users).

Article 4 (Membership Registration)
1. Users apply for membership by entering an email address, password, name, hospital name,
   hospital code, and other information required by the Company. Phone number is optional.
2. Users who register with the same hospital code are considered to belong to the same hospital,
   and data such as rosters is shared among them. The hospital code must therefore be shared
   accurately only with staff of that hospital, and the Company is not responsible for problems
   arising from its unauthorized disclosure.
3. The administrator first registered under a hospital code, or an administrator designated
   through a process agreed upon among members, is responsible for managing the permissions
   (administrator/general user) of members belonging to the same hospital and for managing the
   roster.

Article 5 (Provision and Modification of the Service)
1. The Company provides the following services:
   a. Automatic generation and management of 4-shift rosters
   b. Management of nurse information
   c. Processing of shift-change (swap/substitute) requests and approvals
   d. Roster statistics and export (PDF/Excel)
   e. Other services additionally developed by the Company or provided through partnerships
2. The Company may change the content of the Service and will give prior notice of any such
   change.
3. The Company may temporarily suspend the Service for system maintenance, server failure, or
   other force majeure causes.

Article 6 (User Obligations)
1. Users must comply with applicable laws, these Terms, usage guidelines, and precautions
   announced in connection with the Service.
2. Users may not share or lend their account information (email, password) to third parties, and
   must immediately notify the Company upon discovering account theft or other abnormal use.
3. Users must enter accurate information about the hospital where they actually work and are
   solely responsible for any problems arising from entering false information.
4. Users may not collect, store, or disclose other users' personal information without
   authorization.

Article 7 (Restriction of Service Use)
The Company may restrict a user's use of the Service or suspend an account without prior notice
if the user:
1. Steals another person's personal information or registers false information;
2. Engages in conduct that interferes with the stable operation of the Service; or
3. Violates applicable law or these Terms.

Article 8 (Limitation of Liability)
1. The Company is exempt from liability where it is unable to provide the Service due to natural
   disaster or other force majeure.
2. The Company does not guarantee the accuracy of information entered by users (roster
   assignments, nurse information, etc.). Automatically generated roster results are for reference
   only; responsibility for finalizing the roster and for actual staffing operations rests with
   each hospital (user).
3. The Company has no obligation to intervene in disputes between users, or between a user and a
   third party, arising in connection with the Service, and bears no liability for damages arising
   from such disputes.

Article 9 (Termination of Contract and Restriction of Use)
Users may request to withdraw their membership at any time through in-service inquiry or the
contact information below, and the Company will process such requests in accordance with
applicable law.

Article 10 (Dispute Resolution)
Disputes relating to these Terms shall be governed by the laws of the Republic of Korea, and the
court having jurisdiction over the location of the Company's headquarters shall be the court of
competent jurisdiction.

Supplementary Provision
These Terms take effect on August 2, 2026.

Business Information
- Company name: ${COMPANY_NAME}
- Representative contact: ${COMPANY_PHONE}
- Email: ${COMPANY_EMAIL}
`.trim();

export const PRIVACY_POLICY_EN = `
${COMPANY_NAME} ("the Company") complies with the Personal Information Protection Act and other
applicable laws, and establishes and discloses the following Privacy Policy in order to safely
process users' personal information.

1. Personal Information Collected and Collection Methods
a. At membership registration
   - Required: email (ID), password (stored encrypted), name, hospital name, hospital code
   - Optional: phone number
b. Information automatically generated and collected while using the Service
   - Access logs, service usage records (roster creation/modification history, administrator
     activity logs, etc.)
c. When using the Contact Us feature
   - Inquiry content, email, and contact information if provided
d. Nurse information entered by hospital administrators (including cases where the nurse does not
   have their own membership account)
   - Name, qualification, experience, department, and other minimum information necessary for
     roster assignment. This information is entered under the responsibility of each hospital's
     administrator, and the Company does not guarantee its accuracy.

2. Purposes of Collecting and Using Personal Information
- Member identification and login, provision of the Service on a per-hospital basis
- Roster creation and management, processing of shift-change (swap/substitute) requests
- Receiving and responding to inquiries, delivering notices
- Preventing fraudulent use and maintaining stable Service operation (password resets,
  administrator activity logs, etc.)

3. Retention and Use Period of Personal Information
- In principle, personal information is destroyed without delay upon membership withdrawal.
- Where retention is required under applicable law, information is retained for the period
  prescribed by that law.
- Inquiry records are retained for 3 years after processing is complete, then destroyed.

4. Provision of Personal Information to Third Parties
In principle, the Company does not provide users' personal information to outside parties.
Exceptions are made where the user has given prior consent or where required by law.

5. Outsourcing of Personal Information Processing
The Company outsources the processing of personal information as follows for the provision of the
Service, and stipulates the matters necessary to ensure that personal information is managed
safely under the outsourcing agreement.
- Database and authentication processing: Supabase, Inc. (may use servers located overseas)
- Server hosting: Render Services, Inc. (may use servers located overseas)
- Error monitoring: Sentry (Functional Software, Inc.) (may use servers located overseas)
※ Because the servers of the above outsourced providers may be located overseas, personal
information may be transferred to and stored in other countries.

6. Users' Rights and How to Exercise Them
Users may view or modify their personal information at any time (via "Edit My Info" within the
Service), and may request withdrawal of membership and deletion of personal information. Such
requests are accepted at the contact information below.

7. Destruction of Personal Information
The Company destroys personal information without delay once the retention period has elapsed or
the purpose of processing has been achieved. Information in electronic file form is permanently
deleted using methods that make recovery impossible.

8. Personal Information Protection Officer
- Name/Department: Personal Information Protection Officer, ${COMPANY_NAME}
- Contact: ${COMPANY_PHONE} / ${COMPANY_EMAIL}

9. Duty to Notify
In the event of any addition, deletion, or modification to this Privacy Policy, notice will be
given through announcements within the Service at least 7 days before the effective date.

Effective date: August 2, 2026
`.trim();

// ------------------------------------------------------------------
// 중국어(간체) 번역본 (한국어 원문의 번역이며, 법적 효력은 한국어 원문 기준)
// ------------------------------------------------------------------
export const TERMS_OF_SERVICE_ZH = `
第1条（目的）
本条款旨在规定${COMPANY_NAME}（以下简称"公司"）提供的${SERVICE_NAME}（以下简称"服务"）在使用过程中，
公司与用户之间的权利、义务及责任等相关事项。

第2条（定义）
1. "服务"是指公司提供的医院护士排班表生成与管理、换班申请、相关统计等一切基于网页的软件。
2. "用户"是指根据本条款使用服务的医院所属会员（管理员·普通用户）。
3. "医院代码"是指用户在注册时输入的、用于识别同一医院所属关系的代码。

第3条（条款的效力及变更）
1. 本条款自在服务页面公示或以其他方式通知用户之时起生效。
2. 公司可在不违反相关法律法规的范围内变更本条款，变更时将至少提前7天（对用户不利的变更提前30天）
   公告适用日期及变更理由。

第4条（会员注册）
1. 用户应按照公司规定的程序，输入电子邮箱、密码、姓名、医院名称、医院代码等信息申请注册。
   电话号码为选填项。
2. 使用相同医院代码注册的用户将被视为属于同一医院，排班表等数据将被共享。因此，医院代码只能
   准确传达给所属员工，因擅自泄露该代码而产生的问题，公司不承担责任。
3. 以医院代码首次注册的管理员，或经会员间协商程序指定的管理员，负责管理同一医院所属会员的
   权限（管理员/普通用户）及排班表管理。

第5条（服务的提供及变更）
1. 公司提供以下服务：
   一、四班制排班表自动生成及管理
   二、护士信息管理
   三、换班（对调/代班）申请及审批处理
   四、排班表统计及导出（PDF/Excel）
   五、公司另行开发或通过合作提供的其他服务
2. 公司可变更服务内容，变更时将提前公告变更内容。
3. 因系统维护、服务器故障或其他不可抗力事由，公司可暂时中断服务的提供。

第6条（用户的义务）
1. 用户应遵守相关法律法规、本条款的规定、使用指南及与服务相关公告的注意事项。
2. 用户不得向第三方共享或出借本人的账户信息（电子邮箱、密码），发现账户被盗用等异常使用情况时
   应立即通知公司。
3. 用户应输入其实际工作医院的准确信息，因输入虚假信息而产生的问题由用户本人负责。
4. 用户不得擅自收集、存储、泄露其他用户的个人信息。

第7条（服务使用的限制）
用户如有下列行为之一，公司可不经事先通知限制其服务使用或暂停账户：
1. 盗用他人个人信息或登记虚假信息的情况
2. 妨碍服务稳定运营的行为
3. 违反相关法律法规或本条款的情况

第8条（责任限制）
1. 因天灾或其他不可抗力事由导致公司无法提供服务时，公司免除责任。
2. 公司不保证用户输入信息（排班分配、护士信息等）的准确性，服务提供的自动排班生成结果仅供参考，
   最终排班表的确定及实际人力运营的责任在于各医院（用户）。
3. 对于因服务而在用户相互之间或用户与第三方之间发生的纠纷，公司没有介入的义务，也不承担因此
   产生的损害赔偿责任。

第9条（合同解除及使用限制）
用户可随时通过服务内咨询或以下联系方式申请退出会员，公司将按照相关法律法规的规定进行处理。

第10条（争议解决）
与本条款相关的争议以大韩民国法律为准据法，以公司总部所在地为管辖法院。

附则
本条款自2026年8月2日起施行。

经营者信息
- 商号：${COMPANY_NAME}
- 代表联系方式：${COMPANY_PHONE}
- 电子邮箱：${COMPANY_EMAIL}
`.trim();

export const PRIVACY_POLICY_ZH = `
${COMPANY_NAME}（以下简称"公司"）遵守《个人信息保护法》等相关法律法规，为安全处理用户的个人信息，
特制定并公开如下个人信息处理方针。

1. 收集的个人信息项目及收集方法
一、注册会员时
   - 必填：电子邮箱（账号）、密码（加密存储）、姓名、医院名称、医院代码
   - 选填：电话号码
二、使用服务过程中自动生成及收集的信息
   - 访问日志、服务使用记录（排班表生成/修改历史、管理员活动日志等）
三、使用咨询功能时
   - 咨询内容、电子邮箱、如提供则包括联系方式
四、医院管理员输入的护士信息（包括护士本人未拥有注册账户的情况）
   - 姓名、资格分类、工作经历、部门等排班分配所需的最少信息。该信息由各医院管理员负责输入，
     公司不保证其准确性。

2. 个人信息的收集及使用目的
- 会员身份确认及登录、以医院为单位提供服务
- 排班表生成与管理、换班（对调/代班）申请处理
- 咨询受理及答复、公告事项传达
- 防止不当使用及服务稳定运营（密码重置、管理员活动记录等）

3. 个人信息的保留及使用期限
- 原则上会员退出后立即销毁个人信息。
- 但根据相关法律法规需要保存的情况下，将按该法律法规规定的期限保管。
- 咨询记录在处理完成后保管3年，之后销毁。

4. 个人信息的第三方提供
公司原则上不向外部提供用户的个人信息。但用户事先同意或法律法规另有规定的情况除外。

5. 个人信息处理的委托
公司为提供服务，将个人信息处理委托如下，并在签订委托合同时规定确保个人信息安全管理所需的事项。
- 数据库及身份验证处理：Supabase, Inc.（可能使用海外服务器）
- 服务器托管：Render Services, Inc.（可能使用海外服务器）
- 错误监控：Sentry（Functional Software, Inc.）（可能使用海外服务器）
※ 由于上述受托企业的服务器可能位于境外，个人信息可能被转移至境外并保管。

6. 用户的权利及行使方法
用户可随时查询、修改本人的个人信息（服务内"修改我的信息"），并可申请退出会员及删除个人信息。
相关申请请通过以下联系方式提出。

7. 个人信息的销毁
个人信息保留期限届满或处理目的已达成时，公司将立即销毁相关个人信息。电子文件形式的信息将以
无法恢复的方式永久删除。

8. 个人信息保护负责人
- 姓名/部门：${COMPANY_NAME} 个人信息保护负责人
- 联系方式：${COMPANY_PHONE} / ${COMPANY_EMAIL}

9. 告知义务
本个人信息处理方针如有增加、删除及修改，将在施行至少7天前通过服务内公告告知。

施行日期：2026年8月2日
`.trim();

// 현재 언어(i18next language code)에 맞는 버전을 돌려주는 헬퍼.
// termsText.js 자체는 React 컴포넌트가 아니라 i18n.language 문자열을 그대로 받아 분기한다.
export const getTermsOfService = (lang) => {
  const code = (lang || 'ko').slice(0, 2);
  if (code === 'en') return TERMS_OF_SERVICE_EN;
  if (code === 'zh') return TERMS_OF_SERVICE_ZH;
  return TERMS_OF_SERVICE;
};

export const getPrivacyPolicy = (lang) => {
  const code = (lang || 'ko').slice(0, 2);
  if (code === 'en') return PRIVACY_POLICY_EN;
  if (code === 'zh') return PRIVACY_POLICY_ZH;
  return PRIVACY_POLICY;
};
