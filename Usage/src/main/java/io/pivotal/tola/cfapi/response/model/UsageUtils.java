package io.pivotal.tola.cfapi.response.model;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;

public class UsageUtils {

    public static <T> Predicate<T> uniqueApp(Function<? super T, Object> keyExtractor)
    {
        Map<Object, Boolean> map = new ConcurrentHashMap<>();
        return t -> map.putIfAbsent(keyExtractor.apply(t), Boolean.TRUE) == null;
    }

    public static long computeTotalMbPerAis(List<AppUsage_> au){
        return au.stream().map(o-> o.getMemoryInMbPerInstance()).mapToLong(Integer::longValue).sum();
    }

    public static double computeTotalDurationInSecs(List<AppUsage_> au, int days){
        return (au.stream().map(o->o.getDurationInSeconds()).mapToDouble(Double::doubleValue).sum())/(86400*days);
    }

    public static double computeTotalSIDurationInSecs(List<ServiceUsage_> si, int days){
        return (si.stream().map(o->o.getDurationInSeconds()).mapToDouble(Double::doubleValue).sum())/(86400*days);
    }

    public static List<AppUsage_> getUniqueApps(List<AppUsage_> au){
        return au.stream().filter(UsageUtils.uniqueApp(p -> p.getAppGuid())).collect(Collectors.toList());
    }

    public static List<ServiceUsage_> getUniqueServices(List<ServiceUsage_> si){
        return si.stream().filter(UsageUtils.uniqueApp(p->p.getServiceGuid())).collect(Collectors.toList());
    }
}
