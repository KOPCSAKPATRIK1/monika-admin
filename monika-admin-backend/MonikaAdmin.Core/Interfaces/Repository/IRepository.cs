using System.Linq.Expressions;

namespace MonikaAdmin.Core.Interfaces.Repository;

/// <summary>
/// Generikus adatelérés egy entitástípushoz. A változtatásokat nem menti, azt az <see cref="IUnitOfWork"/> végzi.
/// </summary>
/// <typeparam name="TEntity">Az entitás típusa.</typeparam>
public interface IRepository<TEntity>
    where TEntity : class
{
    /// <summary>
    /// Az összes entitás lekérdezése.
    /// </summary>
    /// <returns>Tovább építhető lekérdezés.</returns>
    IQueryable<TEntity> GetAll();

    /// <summary>
    /// Az összes entitás lekérdezése a megadott kapcsolódó adatokkal együtt.
    /// </summary>
    /// <param name="includes">A betöltendő navigációs property-k.</param>
    /// <returns>Tovább építhető lekérdezés.</returns>
    IQueryable<TEntity> GetAllIncluding(params Expression<Func<TEntity, object>>[] includes);

    /// <summary>
    /// A feltételnek megfelelő entitások lekérdezése.
    /// </summary>
    /// <param name="predicate">A szűrőfeltétel.</param>
    /// <returns>Tovább építhető lekérdezés.</returns>
    IQueryable<TEntity> Find(Expression<Func<TEntity, bool>> predicate);

    /// <summary>
    /// Új entitás felvétele.
    /// </summary>
    /// <param name="entity">A felveendő entitás.</param>
    void Add(TEntity entity);

    /// <summary>
    /// Több új entitás felvétele.
    /// </summary>
    /// <param name="entities">A felveendő entitások.</param>
    void AddRange(IEnumerable<TEntity> entities);

    /// <summary>
    /// Entitás törlése.
    /// </summary>
    /// <param name="entity">A törlendő entitás.</param>
    void Remove(TEntity entity);

    /// <summary>
    /// Entitás módosítottként jelölése.
    /// </summary>
    /// <param name="entity">A módosított entitás.</param>
    void Update(TEntity entity);
}
