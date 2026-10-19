namespace MonikaAdmin.Core.Interfaces.Repository;

/// <summary>
/// Egy felhasználói művelet változtatásainak egyszeri mentése.
/// </summary>
public interface IUnitOfWork
{
    /// <summary>
    /// Az összes függő változtatás mentése egy commitban.
    /// </summary>
    /// <param name="cancellationToken">A művelet megszakítására szolgáló token.</param>
    /// <returns>Az érintett sorok száma.</returns>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
