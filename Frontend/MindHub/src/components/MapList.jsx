import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MapListStyle.css'

function MapList() {

    const navigate = useNavigate();

  const handleEmptyMapClick = () => {
    navigate('/map'); 
  };
    useEffect(() => {
    const templateCards = document.querySelectorAll('.template-card');

    templateCards.forEach(card => {
        card.addEventListener('click', () => {
            templateCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
    });
});
}, []);


  return (
    <>
      <div class="container">
        <header>
            <h1>Добро пожаловать Xsu!</h1>
        </header>
        
        <section class="templates">
            <h2>Шаблоны</h2>
            <div class="template-buttons">
                <div class="template-card selected" onClick={handleEmptyMapClick}>Пустая карта</div>
                <div class="template-card">Интеллект-карта</div>
                <div class="template-card">Органиграмма</div>
                <div class="template-card">Список</div>
                <div class="template-card">Цели SMART</div>
                <div class="template-card">Мой бизнес-план</div>
                <div class="template-card">Заметки Корнелла</div>
                <div class="template-card">Все шаблоны</div>
            </div>
        </section>
        
        <section class="maps-list">
            <h2>Все карты</h2>
            <table>
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Участники</th>
                        <th>Изменено</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Моя новая интеллект-карта</td>
                        <td>Только Вы</td>
                        <td>30 авг. 2024 г.</td>
                    </tr>
                    <tr>
                        <td>Курсовая</td>
                        <td>Только Вы</td>
                        <td>6 сент. 2024 г.</td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
    </>
  )
}

export default MapList
