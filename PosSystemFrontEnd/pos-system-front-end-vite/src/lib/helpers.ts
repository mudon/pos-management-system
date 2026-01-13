export function hasPermission( role: 'admin' | 'cashier' ): boolean
{
    if( role === 'admin' )
        return true;

    return false;
}

export default { hasPermission };