import React from 'react';


import { withTranslation } from 'react-i18next';


// CLASS COMPONENT - Footer
// (클래스 컴포넌트는 useTranslation 훅을 쓸 수 없어서 withTranslation HOC로 t를 props로 받습니다.)
class Footer extends React.Component {
    render() {
        const { t } = this.props;

        return (
            <>

                <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'grey' }}>
                    {t('© 2025 개발: Egwi U. Kelvin. All rights reserved.')}
                </div>
            </>
        );
    }
}
export default withTranslation()(Footer)