export const ConnectionStatus = () => {
    const { isOnline } = useOffline();
    
    return (
        <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? (
                <span>Онлайн</span>
            ) : (
                <span>Оффлайн (изменения сохраняются локально)</span>
            )}
        </div>
    );
};